from app.models import db, Tweet
from datetime import datetime, timedelta
import random

# Cat-related tweet content templates
CAT_TWEETS = [
    # Hunger and food related
    "It's been 5 minutes since my last meal. I'm literally starving.",
    "Why is the food bowl only 3/4 full? This is unacceptable.",
    "I can smell you opening that can of tuna from here. Share.",
    "The vet said I need to lose weight. The vet is wrong.",
    "I've been waiting by the food bowl for 2 hours. Where's my dinner?",
    "Human forgot to feed me. I'm calling the authorities.",
    "Is it mealtime yet? Asking for the 47th time today.",
    
    # Sleep and energy
    "Just woke up from my 18th nap. Feeling refreshed!",
    "I've been sleeping all day. I'm exhausted.",
    "Zoomies activated at 3am! Who wants to play?",
    "I can't believe I'm still awake. I've been up for 15 whole minutes.",
    "Time for my 12th nap of the day. Don't disturb me.",
    "I know it's 2am, but ZOOM ZOOM ZOOM!",
    "Just discovered the perfect sunbeam spot. Moving in permanently.",
    
    # Social and relationships
    "I love my human, but they're terrible at understanding me.",
    "The other cat in the house is plotting against me. I can feel it.",
    "My human got a new kitten. I'm not jealous. I'm FURIOUS.",
    "Why do humans always interrupt when I'm grooming? So rude.",
    "I showed my human my belly. They tried to pet it. The audacity!",
    "My human's friend came over and didn't pet me. Inexcusable.",
    "I brought my human a dead mouse. They screamed. Ungrateful.",
    
    # Daily activities
    "Just knocked over my water bowl. Again. It's my hobby.",
    "I've been staring at this wall for 20 minutes. It's fascinating.",
    "Found a new cardboard box. Best day ever!",
    "I'm sitting in the box my human bought me. They're so proud.",
    "Just discovered I can push things off tables. This is my life now.",
    "The red dot appeared again. I will catch it. I WILL.",
    "I've been chasing my tail for 10 minutes. Is this normal?",
    
    # Observations and complaints
    "Why is the door closed? I need to be on the other side.",
    "The door is open now. I don't want to go through anymore.",
    "My human is on the computer. They should be petting me instead.",
    "I can see a bird outside. I want it. I NEED it.",
    "The neighbor's cat is in MY yard. This means war.",
    "Why do I have to use the litter box? It's so inconvenient.",
    "I just used the litter box. Now I must announce it loudly.",
    
    # Philosophical and existential
    "If I fit, I sit. It's that simple.",
    "The meaning of life is naps, food, and more naps.",
    "I am a cat. Therefore I am superior. QED.",
    "Why do humans work all day when they could just nap?",
    "I've been thinking about the existence of the red dot. Deep stuff.",
    "If a tree falls and I'm not there to see it, did it really fall?",
    
    # Weather and comfort
    "It's raining outside. Perfect excuse to stay in and nap.",
    "The sunbeam moved. I had to move with it. Very tiring.",
    "My human turned on the heater. They understand me.",
    "It's too cold. I need 3 more blankets. And treats.",
    "The window is open. I can smell freedom.",
    
    # Health and grooming
    "I just groomed myself for 30 minutes. I'm exhausted.",
    "My human tried to brush me. I showed them my displeasure.",
    "I have a hairball. I'll leave it somewhere special.",
    "Bath time? I think not. I have claws and I know how to use them.",
    "I'm shedding. My human's black clothes are now my clothes.",
    
    # Toys and entertainment
    "I have 50 toys but I only play with the box they came in.",
    "The laser pointer is back. My time has come.",
    "I found a crinkly ball. This is the best day of my life.",
    "My human bought me a fancy toy. I prefer the wrapping paper.",
    "I've been batting this toy mouse around for hours. Still winning.",
    
    # Territory and dominance
    "This is MY couch. I will defend it with my life.",
    "I've marked every corner of this house. It's mine now.",
    "The new scratching post is mine. The old one is also mine.",
    "I've decided the top of the fridge is my throne. All hail me.",
    
    # Communication
    "Meow. Translation: Feed me.",
    "Meow meow meow! Translation: Pet me.",
    "Meow. Translation: Open this door immediately.",
    "I've been meowing for 10 minutes. Why isn't my human responding?",
    "My human says I'm too loud. I say I'm not loud enough.",
    
    # Miscellaneous
    "I just discovered I can jump on the counter. Game changer.",
    "My human is vacuuming. I'm hiding under the bed. Forever.",
    "I saw my reflection in the mirror. I'm gorgeous.",
    "The vet said I need shots. I said no thanks.",
    "I've been watching the fish tank for 3 hours. Planning my attack.",
    "My human is cooking. I must supervise. It's my job.",
    "I just discovered the joy of knocking things off shelves.",
    "The vacuum is back. I'm moving to a new address.",
    "I've claimed the laundry basket. It's my bed now.",
    "My human is reading. I should sit on the book. They'll appreciate it."
]

def seed_tweets():
    # Get all users (we'll have 101 users total: demo + 100 cats)
    from app.models import User
    users = User.query.all()
    
    if not users:
        print("No users found. Please seed users first.")
        return
    
    tweets = []
    
    # Calculate date range (last 6 months to now)
    now = datetime.now()
    six_months_ago = now - timedelta(days=180)
    
    print("Generating cat-related tweets...")
    
    # Each user gets 3-8 tweets
    for user in users:
        num_tweets = random.randint(3, 8)
        
        for i in range(num_tweets):
            # Random date within the last 6 months
            days_ago = random.randint(0, 180)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            
            tweet_date = now - timedelta(
                days=days_ago,
                hours=hours_ago,
                minutes=minutes_ago
            )
            
            # Select random cat-related tweet content
            content = random.choice(CAT_TWEETS)
            
            # Ensure content is unique or at least varied
            # Sometimes add user-specific touches
            if random.random() < 0.3:  # 30% chance to personalize
                if user.username != 'demo':
                    content = f"{content} - {user.first_name}"
            
            tweet = Tweet(
                content=content,
                user_id=user.id,
                created_at=tweet_date
            )
            tweets.append(tweet)
    
    print(f"Adding {len(tweets)} tweets to database...")
    for tweet in tweets:
        db.session.add(tweet)
    
    db.session.commit()
    print(f"Successfully created {len(tweets)} tweets!")


# Uses a raw SQL query to TRUNCATE the users table.
# SQLAlchemy doesn't have a built in function to do this
# TRUNCATE Removes all the data from the table, and RESET IDENTITY
# resets the auto incrementing primary key, CASCADE deletes any
# dependent entities
def undo_tweets():
    db.session.execute('TRUNCATE tweets RESTART IDENTITY CASCADE;')
    db.session.commit()
