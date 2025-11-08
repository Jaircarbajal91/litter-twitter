from app.models import db, User, Image
import requests
import random
import time

# Cat names pool for variety
CAT_FIRST_NAMES = [
    'Whiskers', 'Fluffy', 'Mittens', 'Shadow', 'Luna', 'Simba', 'Bella', 'Max', 'Tiger', 'Chloe',
    'Oreo', 'Smokey', 'Milo', 'Nala', 'Oliver', 'Lucy', 'Charlie', 'Sophie', 'Jack', 'Lily',
    'Maggie', 'Rocky', 'Zoe', 'Toby', 'Chloe', 'Jasper', 'Ginger', 'Loki', 'Mia', 'Sam',
    'Coco', 'Felix', 'Daisy', 'Oscar', 'Ruby', 'Buddy', 'Penny', 'Leo', 'Lola', 'Simon',
    'Princess', 'Gizmo', 'Muffin', 'Pepper', 'Sasha', 'Boots', 'Patches', 'Socks', 'Pumpkin', 'Jinx',
    'Midnight', 'Snowball', 'Tigger', 'Casper', 'Bandit', 'Misty', 'Salem', 'Cleo', 'Phoebe', 'Zeus',
    'Athena', 'Apollo', 'Artemis', 'Hermes', 'Hera', 'Poseidon', 'Ares', 'Dionysus', 'Hades', 'Demeter',
    'Nyx', 'Echo', 'Juno', 'Venus', 'Mars', 'Mercury', 'Neptune', 'Pluto', 'Jupiter', 'Saturn',
    'Nebula', 'Comet', 'Stardust', 'Cosmo', 'Galaxy', 'Aurora', 'Nova', 'Stella', 'Orion', 'Sirius',
    'Pixel', 'Byte', 'Noodle', 'Bagel', 'Waffles', 'Mochi', 'Sushi', 'Tofu', 'Ramen', 'Kimchi'
]

CAT_LAST_NAMES = [
    'Whiskerpaws', 'Meowington', 'Purrington', 'Furball', 'Clawson', 'Pawsworth', 'Snugglesworth',
    'Fluffington', 'Mittensworth', 'Cuddleworth', 'Purrson', 'Feline', 'Catterson', 'Meowsworth',
    'Pawsworth', 'Whiskersworth', 'Furlington', 'Clawsworth', 'Snugglepaws', 'Purrlington',
    'Meowpaws', 'Flufferson', 'Cuddlepaws', 'Whiskerson', 'Purrson', 'Furlington', 'Pawlington',
    'Snuggleworth', 'Clawworth', 'Meowlington', 'Furworth', 'Whiskerworth', 'Purrworth', 'Fluffworth',
    'Cuddleworth', 'Mittensworth', 'Pawworth', 'Snuggleworth', 'Clawworth', 'Meowworth'
]

def get_cat_image():
    """Fetch a unique cat image URL from cat APIs"""
    # Primary: Use The Cat API (no auth needed for basic requests, returns JSON with URL)
    try:
        response = requests.get('https://api.thecatapi.com/v1/images/search', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                return data[0]['url']
    except:
        pass
    
    # Fallback: Use Cataas direct image URLs (these work as direct image URLs)
    try:
        cataas_endpoints = [
            'https://cataas.com/cat',
            'https://cataas.com/cat/gif',
            'https://cataas.com/cat/cute',
            'https://cataas.com/cat?width=400&height=400',
        ]
        # These URLs work directly as image sources
        return random.choice(cataas_endpoints)
    except:
        pass
    
    # Final fallback
    return 'https://cataas.com/cat'

def seed_users():
    users = []
    
    # Keep the demo user
    demo = User(
        username='demo', 
        email='demo@aa.io', 
        first_name='Demo', 
        last_name='User',  
        password='password', 
        profile_image='https://res.cloudinary.com/dvkihdv0n/image/upload/v1661910820/litter-twitter/VIER_20PFOTEN_2016-07-08_011-4993x3455-1920x1329_ri4djn.jpg'
    )
    users.append(demo)
    demo_banner = Image(
        type='user_header',
        key=f"seed/user-banner/demo-{random.randint(1000, 9999)}",
        url=get_cat_image()
    )
    demo.user_images.append(demo_banner)
    
    # Generate 100 cat users
    used_usernames = {'demo'}
    used_emails = {'demo@aa.io'}
    
    print("Generating 100 cat users...")
    for i in range(100):
        # Generate unique username
        first_name = random.choice(CAT_FIRST_NAMES)
        last_name = random.choice(CAT_LAST_NAMES)
        username = f"{first_name.lower()}{random.randint(1, 999)}"
        
        # Ensure username is unique
        while username in used_usernames:
            username = f"{first_name.lower()}{random.randint(1, 9999)}"
        used_usernames.add(username)
        
        # Generate unique email
        email = f"{username}@cat.meow"
        while email in used_emails:
            email = f"{username}{random.randint(1, 999)}@cat.meow"
        used_emails.add(email)
        
        # Get cat image (with small delay to avoid rate limiting)
        if i % 5 == 0:
            time.sleep(0.3)  # Small delay every 5 users to avoid rate limits
        profile_image = get_cat_image()
        
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password='password',
            profile_image=profile_image
        )
        users.append(user)

        banner_image = get_cat_image()
        banner = Image(
            type='user_header',
            key=f"seed/user-banner/{username}-{random.randint(1000, 9999)}",
            url=banner_image
        )
        user.user_images.append(banner)
        
        if (i + 1) % 20 == 0:
            print(f"  Created {i + 1} users...")
    
    print("Adding users to database...")
    for user in users:
        db.session.add(user)
    
    db.session.commit()
    print(f"Successfully created {len(users)} users!")


# Uses a raw SQL query to TRUNCATE the users table.
# SQLAlchemy doesn't have a built in function to do this
# TRUNCATE Removes all the data from the table, and RESET IDENTITY
# resets the auto incrementing primary key, CASCADE deletes any
# dependent entities
def undo_users():
    db.session.execute('TRUNCATE users RESTART IDENTITY CASCADE;')
    db.session.commit()
