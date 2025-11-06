from app.models import db, Comment
from datetime import datetime, timedelta
import random

# Cat-related comment responses that form conversations
COMMENT_RESPONSES = [
    # Agreement and support
    "Same! I feel this on a spiritual level.",
    "This is so relatable. Me too!",
    "Exactly! Preach it!",
    "I couldn't agree more.",
    "This speaks to my soul.",
    "100% this. All of this.",
    "You've captured my exact feelings.",
    
    # Empathy and understanding
    "I've been there. It's rough.",
    "Hang in there, friend!",
    "You're not alone in this.",
    "I understand your pain.",
    "That's tough. Sending virtual headbutts.",
    "This is a mood and I'm here for it.",
    
    # Food-related responses
    "The struggle is real. My bowl is also empty.",
    "I just checked my bowl. Still empty. The horror!",
    "My human forgot to feed me yesterday. I survived. Barely.",
    "I relate. Food is life.",
    "Treats are the solution to everything.",
    "I've been meowing at mine for 2 hours. No response.",
    
    # Play and energy responses
    "Zoomies are the best! I had them at 4am.",
    "I love the 3am zoomies. Keeps my human on their toes.",
    "Same! I've been running around like crazy.",
    "The red dot is my nemesis. I will conquer it!",
    "I've been chasing shadows all day. So fun!",
    
    # Sleep responses
    "Naps are the best. I'm taking one now.",
    "I've taken 15 naps today. Still tired.",
    "Sleep is life. Life is sleep.",
    "I just woke up from a nap. Time for another nap.",
    "The sunbeam called. I had to answer.",
    
    # Social responses
    "My human doesn't understand me either. It's frustrating.",
    "Humans are so hard to train. We need to be patient.",
    "I love my human but they're clueless sometimes.",
    "Tell me about it. Mine does the same thing.",
    "I've been trying to train mine for years. No progress.",
    
    # Territory and dominance
    "That's MY spot. I claimed it yesterday.",
    "I've marked everything in my house. It's all mine.",
    "The couch is mine. I don't share.",
    "I feel you. Territory is important.",
    
    # Daily struggles
    "I also knock things over. It's my hobby.",
    "I've broken so many things. My human just sighs now.",
    "The struggle is real. I relate 100%.",
    "I do this too! It's normal. Right?",
    "I thought I was the only one!",
    
    # Questions and curiosity
    "Wait, really? That's interesting.",
    "I need to try this. Thanks for the tip!",
    "How do you do this? I need instructions.",
    "Tell me more! I'm curious.",
    "I've never thought about it that way.",
    
    # Humor and sarcasm
    "LOL. This is hilarious.",
    "I'm dying. This is too funny.",
    "Haha! My human does this too.",
    "The accuracy is off the charts.",
    "This made my day. Thank you.",
    
    # Support and encouragement
    "You got this! Don't give up.",
    "Stay strong, friend!",
    "You're doing great. Keep it up!",
    "I believe in you!",
    "You're not alone in this journey.",
    
    # Relatable experiences
    "I just did this yesterday. So accurate.",
    "This happened to me last week. Still recovering.",
    "I'm going through this right now. It's rough.",
    "I've been there. It gets better.",
    "Same thing happened to me. I feel your pain.",
    
    # Philosophical responses
    "Deep. This makes me think.",
    "The truth has been spoken.",
    "This is wisdom. Pure wisdom.",
    "You've opened my eyes to something new.",
    "I never thought about it this way before.",
    
    # Complaints and venting
    "Ugh, I hate when this happens.",
    "Why do humans do this? It's so annoying.",
    "This is the worst. I feel your pain.",
    "I'm so frustrated. This keeps happening.",
    "I wish they would understand us better.",
    
    # Celebrations
    "Yay! Congratulations!",
    "This is amazing! So happy for you!",
    "You did it! I'm proud of you.",
    "This calls for treats!",
    "Woo! This is great news!",
    
    # More specific cat responses
    "I brought mine a dead bird. They didn't appreciate it either.",
    "The litter box situation is real. I feel this.",
    "I've been staring at walls too. It's therapeutic.",
    "Boxes are life. I don't understand why humans don't get it.",
    "I've claimed the top of the fridge. It's my kingdom now.",
    "The red dot is my arch-nemesis. One day I'll catch it.",
    "I've been grooming myself for an hour. Still not done.",
    "My human is vacuuming. I'm in full panic mode.",
    "I just discovered I can jump on the counter. Game over.",
    "The neighbor's cat is in my yard. This is war.",
]

# Conversation starters that respond to specific tweet types
TWEET_RESPONSE_TEMPLATES = {
    'food': [
        "My bowl is also empty! This is an emergency!",
        "I just checked mine. Still empty. The horror!",
        "Food is life. Life is food. I relate so much.",
        "My human forgot to feed me yesterday. I'm still recovering.",
        "I've been meowing for food for 3 hours. No response.",
        "Treats are the answer to everything. Always.",
        "I'm starving too. We need to form a union.",
    ],
    'sleep': [
        "Naps are the best part of the day. Change my mind.",
        "I just woke up from my 12th nap. Time for another!",
        "Sleep is life. I've perfected the art of napping.",
        "The sunbeam is calling. I must answer.",
        "I've been sleeping all day. I'm exhausted.",
        "Naps > everything else. It's a fact.",
    ],
    'social': [
        "My human doesn't understand me either. It's tough.",
        "Humans are so hard to train. We need patience.",
        "I love mine but they're clueless sometimes.",
        "Tell me about it. Same situation here.",
        "I've been trying to train mine for years.",
        "They'll learn eventually. Maybe. Probably not.",
    ],
    'play': [
        "Zoomies at 3am are the best! Keeps them on their toes.",
        "I've been chasing shadows all day. So fun!",
        "The red dot is my nemesis. I will catch it!",
        "I love the zoomies. Energy is life!",
        "I've been running around like crazy too!",
        "Playtime is the best time of day!",
    ],
    'territory': [
        "That's MY spot! I claimed it first!",
        "I've marked everything. It's all mine.",
        "Territory is important. I feel you.",
        "The couch is mine. I don't share. Ever.",
        "I've claimed the top of the fridge. It's my kingdom.",
        "Everything is mine. I've decided.",
    ],
}

def get_comment_responses(tweet_content, num_comments=5):
    """Generate conversation-style comments based on tweet content"""
    responses = []
    
    # Determine tweet category based on keywords
    content_lower = tweet_content.lower()
    category = 'general'
    
    if any(word in content_lower for word in ['food', 'feed', 'hungry', 'meal', 'eat', 'tuna', 'treat']):
        category = 'food'
    elif any(word in content_lower for word in ['sleep', 'nap', 'wake', 'tired', 'bed']):
        category = 'sleep'
    elif any(word in content_lower for word in ['human', 'master', 'pet', 'understand']):
        category = 'social'
    elif any(word in content_lower for word in ['zoom', 'play', 'chase', 'red dot', 'toy']):
        category = 'play'
    elif any(word in content_lower for word in ['mine', 'territory', 'couch', 'spot', 'yard']):
        category = 'territory'
    
    # Get category-specific responses if available
    if category in TWEET_RESPONSE_TEMPLATES:
        category_responses = TWEET_RESPONSE_TEMPLATES[category]
        # Mix category-specific with general responses
        responses.extend(random.sample(category_responses, min(3, len(category_responses))))
        responses.extend(random.sample(COMMENT_RESPONSES, num_comments - len(responses)))
    else:
        responses.extend(random.sample(COMMENT_RESPONSES, num_comments))
    
    return responses[:num_comments]

def seed_comments():
    from app.models import User, Tweet
    
    # Get all tweets and users
    tweets = Tweet.query.all()
    users = User.query.all()
    
    if not tweets or not users:
        print("No tweets or users found. Please seed users and tweets first.")
        return
    
    comments = []
    
    print("Generating conversation comments...")
    
    for tweet in tweets:
        # Each tweet gets 5-8 comments (at least 5 as requested)
        num_comments = random.randint(5, 8)
        
        # Get responses that make sense for this tweet
        responses = get_comment_responses(tweet.content, num_comments)
        
        # Get tweet's creation date
        tweet_date = tweet.created_at if tweet.created_at else datetime.now()
        
        for i, response_text in enumerate(responses):
            # Select a random user (but not the tweet author for most comments)
            available_users = [u for u in users if u.id != tweet.user_id]
            
            # Occasionally allow the author to reply (10% chance)
            if random.random() < 0.1 and len(available_users) > 0:
                commenter = random.choice(users)
            else:
                if not available_users:
                    commenter = users[0]  # Fallback
                else:
                    commenter = random.choice(available_users)
            
            # Comment date should be after tweet date, but within reasonable time
            # Comments can be from minutes to days after the tweet
            hours_after = random.randint(0, 72)  # Up to 3 days after
            minutes_after = random.randint(0, 59)
            
            comment_date = tweet_date + timedelta(hours=hours_after, minutes=minutes_after)
            
            # Ensure comment date is not in the future
            now = datetime.now()
            if comment_date > now:
                comment_date = now
            
            comment = Comment(
                content=response_text,
                user_id=commenter.id,
                tweet_id=tweet.id,
                created_at=comment_date
            )
            comments.append(comment)
    
    print(f"Adding {len(comments)} comments to database...")
    for comment in comments:
        db.session.add(comment)
    
    db.session.commit()
    print(f"Successfully created {len(comments)} comments!")


# Uses a raw SQL query to TRUNCATE the users table.
# SQLAlchemy doesn't have a built in function to do this
# TRUNCATE Removes all the data from the table, and RESET IDENTITY
# resets the auto incrementing primary key, CASCADE deletes any
# dependent entities
def undo_comments():
    db.session.execute('TRUNCATE comments RESTART IDENTITY CASCADE;')
    db.session.commit()
