from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# --- Models ---

class Stats(BaseModel):
    rit: int = 70
    tir: int = 70
    pas: int = 70
    reg: int = 70
    def_: int = Field(default=70, alias='def')
    fis: int = 70
    con: int = 70
    res: int = 70
    cab: int = 70
    
    model_config = ConfigDict(populate_by_name=True)

class Position(BaseModel):
    x: float
    y: float

class Player(BaseModel):
    id: str
    name: str
    nickname: Optional[str] = ""
    number: str
    role: str
    avatar: Optional[str] = ""
    stats: Stats
    position: Position
    votes: List[Dict[str, int]] = []

class PitchSettings(BaseModel):
    mode: str = '11'
    formation: str = '4-3-3'
    color: str = 'green'
    texture: str = 'striped'
    kitColor: str = '#ef4444'
    kitNumberColor: str = '#ffffff'
    viewMode: str = '2d'

class ClubInfo(BaseModel):
    name: str = 'MI EQUIPO FC'
    logo: str = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png'

class Team(BaseModel):
    players: List[Player] = []
    pitchSettings: PitchSettings
    clubInfo: ClubInfo

# --- Routes ---

@api_router.get("/")
async def root():
    return {"message": "Soccer Builder API"}

@api_router.get("/team", response_model=Team)
async def get_team():
    # Try to find the existing team (singleton for this demo)
    team_doc = await db.teams.find_one({"_id": "default_team"})
    
    if team_doc:
        return Team(**team_doc)
    
    # Create default if not exists
    default_team = Team(
        players=[],
        pitchSettings=PitchSettings(),
        clubInfo=ClubInfo()
    )
    await db.teams.insert_one({"_id": "default_team", **default_team.model_dump()})
    return default_team

@api_router.post("/team", response_model=Team)
async def save_team(team: Team):
    await db.teams.replace_one(
        {"_id": "default_team"},
        {"_id": "default_team", **team.model_dump()},
        upsert=True
    )
    return team

@api_router.get("/player/{player_id}", response_model=Player)
async def get_player(player_id: str):
    team_doc = await db.teams.find_one({"_id": "default_team"})
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
    
    players = team_doc.get("players", [])
    for p in players:
        if p["id"] == player_id:
            return Player(**p)
            
    raise HTTPException(status_code=404, detail="Player not found")

@api_router.post("/player/{player_id}/vote")
async def vote_player(player_id: str, vote_stats: Stats):
    team_doc = await db.teams.find_one({"_id": "default_team"})
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
    
    players = team_doc.get("players", [])
    player_index = -1
    
    for i, p in enumerate(players):
        if p["id"] == player_id:
            player_index = i
            break
            
    if player_index == -1:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Add vote
    current_player = players[player_index]
    votes = current_player.get("votes", [])
    votes.append(vote_stats.model_dump())
    
    # Recalculate averages
    new_stats = current_player["stats"].copy()
    if votes:
        for key in new_stats:
            total = sum(v.get(key, 0) for v in votes)
            new_stats[key] = round(total / len(votes))
            
    # Update in DB
    current_player["votes"] = votes
    current_player["stats"] = new_stats
    players[player_index] = current_player
    
    await db.teams.update_one(
        {"_id": "default_team"},
        {"$set": {"players": players}}
    )
    
    return {"message": "Vote recorded", "new_stats": new_stats}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
