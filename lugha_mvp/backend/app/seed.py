"""Seed countries, languages, badges, and a demo user with sample contributions."""
from dotenv import load_dotenv
load_dotenv()

from .database import Base, engine, SessionLocal
from .models import Country, Language, User, Badge, UserBadge, Contribution, UserLanguage
from .auth import hash_password
from .data.africa_countries import AFRICA_54
from .migrations import run_migrations

Base.metadata.create_all(bind=engine)
run_migrations()
db = SessionLocal()

COUNTRIES = AFRICA_54

LANGUAGES = [
    ("Swahili", "sw", "Bantu", 200_000_000, "TZ", 0, "Lingua franca of East Africa"),
    ("Hausa", "ha", "Afro-Asiatic", 70_000_000, "NG", 0, "West & Central Africa"),
    ("Yoruba", "yo", "Niger-Congo", 45_000_000, "NG", 0, "Nigeria, Benin, Togo"),
    ("Igbo", "ig", "Niger-Congo", 27_000_000, "NG", 0, "South-eastern Nigeria"),
    ("Amharic", "am", "Afro-Asiatic", 32_000_000, "ET", 0, "Ethiopia"),
    ("Oromo", "om", "Afro-Asiatic", 37_000_000, "ET", 0, "Ethiopia & Kenya"),
    ("Zulu", "zu", "Bantu", 12_000_000, "ZA", 0, "South Africa"),
    ("Xhosa", "xh", "Bantu", 8_000_000, "ZA", 0, "South Africa"),
    ("Afrikaans", "af", "Germanic", 7_000_000, "ZA", 0, "South Africa & Namibia"),
    ("Shona", "sn", "Bantu", 9_000_000, "ZW", 0, "Zimbabwe"),
    ("Wolof", "wo", "Niger-Congo", 12_000_000, "SN", 0, "Senegal"),
    ("Twi", "tw", "Niger-Congo", 9_000_000, "GH", 0, "Ghana (Akan)"),
    ("Lingala", "ln", "Bantu", 20_000_000, "CD", 0, "DR Congo"),
    ("Kinyarwanda", "rw", "Bantu", 13_000_000, "RW", 0, "Rwanda"),
    ("Luganda", "lg", "Bantu", 10_000_000, "UG", 0, "Uganda"),
    ("Bambara", "bm", "Mande", 14_000_000, "ML", 0, "Mali"),
    ("Sukuma", "suk", "Bantu", 9_000_000, "TZ", 1, "Tanzania"),
    ("Tigrinya", "ti", "Afro-Asiatic", 9_000_000, "ER", 0, "Eritrea & Ethiopia"),
    ("Somali", "so", "Afro-Asiatic", 22_000_000, "SO", 0, "Horn of Africa"),
    ("Fulfulde", "ff", "Niger-Congo", 40_000_000, "NG", 0, "Sahel"),
    ("Arabic", "ar", "Afro-Asiatic", 100_000_000, "EG", 0, "North Africa"),
    ("Tamazight", "ber", "Afro-Asiatic", 30_000_000, "MA", 1, "Amazigh languages"),
    ("Chichewa", "ny", "Bantu", 12_000_000, "MW", 0, "Malawi & Zambia"),
    ("Kikuyu", "ki", "Bantu", 8_000_000, "KE", 0, "Kenya"),
    ("Luo", "luo", "Nilo-Saharan", 6_000_000, "KE", 0, "Kenya & Tanzania"),
    ("Maasai", "mas", "Nilo-Saharan", 1_500_000, "KE", 1, "Kenya & Tanzania"),
    ("Kamba", "kam", "Bantu", 4_500_000, "KE", 0, "Kenya"),
    ("Meru", "mer", "Bantu", 2_000_000, "KE", 0, "Kenya"),
    ("Chagga", "chg", "Bantu", 2_000_000, "TZ", 1, "Tanzania"),
    ("Makonde", "mkd", "Bantu", 1_800_000, "TZ", 1, "Tanzania & Mozambique"),
    ("Nyamwezi", "nym", "Bantu", 1_500_000, "TZ", 1, "Tanzania"),
    ("Sandawe", "sad", "Isolate", 60_000, "TZ", 1, "Tanzania"),
    ("Hadza", "htz", "Isolate", 1_000, "TZ", 1, "Tanzania"),
    ("Malagasy", "mg", "Austronesian", 25_000_000, "MG", 0, "Madagascar"),
    ("Sesotho", "st", "Bantu", 5_600_000, "LS", 0, "Lesotho & South Africa"),
    ("Setswana", "tn", "Bantu", 4_000_000, "BW", 0, "Botswana"),
    ("Sepedi", "nso", "Bantu", 4_700_000, "ZA", 0, "South Africa"),
    ("Venda", "ve", "Bantu", 1_300_000, "ZA", 1, "South Africa"),
    ("Tsonga", "ts", "Bantu", 2_300_000, "ZA", 0, "Southern Africa"),
    ("Ndebele", "nd", "Bantu", 2_000_000, "ZW", 0, "Zimbabwe"),
    ("Herero", "hz", "Bantu", 200_000, "NA", 1, "Namibia"),
    ("Kikongo", "kg", "Bantu", 6_000_000, "CD", 0, "DR Congo & Angola"),
    ("Tshiluba", "lua", "Bantu", 6_500_000, "CD", 0, "DR Congo"),
    ("Sango", "sg", "Creole", 5_000_000, "CF", 0, "Central African Republic"),
    ("Ewe", "ee", "Niger-Congo", 7_000_000, "TG", 0, "Ghana & Togo"),
    ("Fon", "fon", "Niger-Congo", 2_000_000, "BJ", 0, "Benin"),
    ("Mooré", "mos", "Niger-Congo", 5_000_000, "BF", 0, "Burkina Faso"),
    ("Dioula", "dyu", "Mande", 12_000_000, "CI", 0, "Côte d'Ivoire"),
    ("Mandinka", "mnk", "Mande", 1_300_000, "GM", 0, "Gambia"),
    ("Serer", "srr", "Niger-Congo", 1_200_000, "SN", 1, "Senegal"),
    ("Kanuri", "kau", "Nilo-Saharan", 4_000_000, "NE", 0, "Niger & Nigeria"),
    ("Edo", "edo", "Niger-Congo", 1_000_000, "NG", 1, "Nigeria"),
    ("Ibibio", "ibb", "Niger-Congo", 4_500_000, "NG", 0, "Nigeria"),
    ("Tiv", "tiv", "Niger-Congo", 2_000_000, "NG", 0, "Nigeria"),
    ("Urhobo", "urh", "Niger-Congo", 1_000_000, "NG", 1, "Nigeria"),
    ("Ga", "gaa", "Niger-Congo", 600_000, "GH", 0, "Ghana"),
    ("Dagbani", "dag", "Niger-Congo", 1_000_000, "GH", 0, "Ghana"),
    ("Krio", "kri", "Creole", 4_000_000, "SL", 0, "Sierra Leone"),
    ("Mende", "men", "Mande", 1_500_000, "SL", 0, "Sierra Leone"),
    ("Temne", "tem", "Niger-Congo", 2_000_000, "SL", 0, "Sierra Leone"),
    ("Bemba", "bem", "Bantu", 4_000_000, "ZM", 0, "Zambia"),
    ("Nyanja", "nya", "Bantu", 12_000_000, "ZM", 0, "Zambia & Malawi"),
    ("Kirundi", "run", "Bantu", 9_000_000, "BI", 0, "Burundi"),
    ("Lugbara", "lgg", "Nilo-Saharan", 1_000_000, "UG", 1, "Uganda"),
    ("Afar", "aa", "Afro-Asiatic", 2_000_000, "ET", 1, "Horn of Africa"),
    ("Sidamo", "sid", "Afro-Asiatic", 3_000_000, "ET", 1, "Ethiopia"),
    ("Nuer", "nus", "Nilo-Saharan", 1_500_000, "SS", 1, "South Sudan"),
    ("Dinka", "din", "Nilo-Saharan", 1_500_000, "SS", 1, "South Sudan"),
    ("Berber", "ber2", "Afro-Asiatic", 5_000_000, "MA", 1, "Morocco & Algeria"),
    ("French", "fr", "Romance", 120_000_000, "SN", 0, "Widely spoken in Africa"),
    ("English", "en", "Germanic", 200_000_000, "NG", 0, "Official across Africa"),
    ("Portuguese", "pt", "Romance", 30_000_000, "AO", 0, "Angola & Mozambique"),
]

BADGES = [
    ("guardian", "Language Guardian", "🏆", "Contribute 500+ words"),
    ("trainer",  "AI Trainer",        "🤖", "50+ audio recordings"),
    ("keeper",   "Story Keeper",      "📚", "10+ heritage uploads"),
    ("heritage", "Heritage Hero",     "🌍", "Preserve a rare language"),
    ("translator", "Master Translator", "🌐", "1000+ translations"),
    ("flame",    "Tamaduni Flame",    "🔥", "30-day contribution streak"),
    ("pioneer",  "Pioneer",           "⭐", "One of the first 100 contributors"),
]


def upsert_country(name, iso, flag, region):
    c = db.query(Country).filter_by(iso_code=iso).first()
    if not c:
        c = Country(name=name, iso_code=iso, flag_emoji=flag, region=region)
        db.add(c); db.flush()
    return c


def upsert_language(name, iso, family, speakers, country, endangered, desc):
    l = db.query(Language).filter_by(name=name).first()
    if not l:
        l = Language(name=name, iso_code=iso, family=family, speakers=speakers,
                     country_id=country.id, is_endangered=endangered, description=desc)
        db.add(l); db.flush()
    return l


country_map = {iso: upsert_country(n, iso, f, r) for (n, iso, f, r) in COUNTRIES}
lang_map = {}
for (n, iso, fam, sp, ciso, end, desc) in LANGUAGES:
    lang_map[n] = upsert_language(n, iso, fam, sp, country_map[ciso], end, desc)

for code, name, icon, desc in BADGES:
    if not db.query(Badge).filter_by(code=code).first():
        db.add(Badge(code=code, name=name, icon=icon, description=desc))

# demo user — create or refresh profile
demo = db.query(User).filter_by(email="demo@lugha.africa").first()
if not demo:
    demo = User(
        name="Perfect Mwangi", username="perfect", email="demo@lugha.africa",
        password_hash=hash_password("demo1234"),
        country_id=country_map["TZ"].id, avatar_initial="P", points=150,
    )
    db.add(demo); db.flush()
    db.add(UserLanguage(user_id=demo.id, language_id=lang_map["Swahili"].id, role="speaks"))
    db.add(UserLanguage(user_id=demo.id, language_id=lang_map["Sukuma"].id, role="speaks"))
    db.add(UserLanguage(user_id=demo.id, language_id=lang_map["Yoruba"].id, role="learning"))

    sample = [
        ("Sukuma", "Ng'wana", "Child", "Ng'wana wangu ana miaka mitatu.", "noun", "Mwanza Region"),
        ("Swahili", "Ubuntu", "Humanity / I am because we are", "Ubuntu ni utu wa watu.", "noun", "East Africa"),
        ("Yoruba", "Bawo", "Hello / How", "Bawo ni o se wa?", "interj", "Lagos"),
        ("Zulu", "Sawubona", "I see you (hello)", "Sawubona, unjani?", "interj", "KwaZulu-Natal"),
        ("Amharic", "ሰላም (Selam)", "Peace / Hello", "Selam, dehna neh?", "interj", "Addis Ababa"),
        ("Hausa", "Sannu", "Hello", "Sannu, ina kwana?", "interj", "Kano"),
        ("Igbo", "Ndewo", "Hello", "Ndewo nna m.", "interj", "Enugu"),
        ("Wolof", "Nanga def", "How are you?", "Nanga def? Maa ngi fi.", "phrase", "Dakar"),
    ]
    for lname, word, meaning, ex, pos, region in sample:
        db.add(Contribution(
            user_id=demo.id, language_id=lang_map[lname].id,
            word=word, meaning=meaning, example=ex, part_of_speech=pos,
            content_type="word", region=region, upvotes=3,
        ))

    heritage = [
        ("Swahili", "folktale", "The Clever Hare and the Elephant King",
         "In the days when all animals spoke freely, a small hare outwitted the great elephant through patience and wit — teaching that wisdom holds more power than strength.",
         "East Africa · 3 min read"),
        ("Swahili", "proverb", "Umoja ni nguvu, utengano ni udhaifu",
         "Unity is strength, division is weakness. One of East Africa's most enduring proverbs, woven into the founding of multiple nations.",
         "East Africa · Proverb"),
        ("Swahili", "song", "Malaika — the Angel Song",
         "A beloved Swahili folk song that has traveled across generations, speaking of love, longing, and the beauty found in simplicity.",
         "Kenya/Tanzania · Folk song"),
        ("Sukuma", "riddle", "Naomba jibu — ancient Sukuma riddles",
         "Traditional riddles used to teach children logic, nature observation, and cultural values. Passed orally for centuries, now digitally preserved.",
         "Mwanza, Tanzania · 12 riddles"),
        ("Yoruba", "proverb", "Bi eniyan ba n gbo, a o gbo",
         "If one listens, one will hear. A Yoruba reminder that wisdom begins with attentive ears and open hearts.",
         "Nigeria · Proverb"),
        ("Zulu", "story", "Ubuntu ungumuntu ngabantu",
         "I am because we are. A philosophical cornerstone of Southern African humanity — community as the measure of personhood.",
         "South Africa · Philosophy"),
    ]
    for lname, ctype, title, excerpt, meta in heritage:
        db.add(Contribution(
            user_id=demo.id, language_id=lang_map[lname].id,
            word=title, meaning=excerpt, example=meta,
            part_of_speech=ctype, content_type=ctype, region=meta.split("·")[0].strip(),
            upvotes=12,
        ))

    # award badges
    for code in ("trainer", "keeper", "pioneer"):
        b = db.query(Badge).filter_by(code=code).first()
        db.add(UserBadge(user_id=demo.id, badge_id=b.id))

else:
    demo.username = "perfect"
    demo.name = "Perfect Mwangi"
    if not demo.password_hash:
        demo.password_hash = hash_password("demo1234")

# Community members for partners & live feed variety
PARTNER_USERS = [
    ("Adaeze Okonkwo", "adaeze@lugha.africa", "NG", ["Yoruba", "Igbo", "Hausa"], ["Swahili"]),
    ("Kofi Mensah", "kofi@lugha.africa", "GH", ["Twi"], ["Yoruba", "Swahili"]),
    ("Fatuma Tarehe", "fatuma@lugha.africa", "TZ", ["Swahili", "Sukuma"], ["French"]),
    ("Biruk Haile", "biruk@lugha.africa", "ET", ["Amharic", "Tigrinya"], ["Swahili"]),
]
for pname, email, ciso, speaks, learning in PARTNER_USERS:
    if db.query(User).filter_by(email=email).first():
        continue
    uname = email.split("@")[0].replace(".", "_")
    u = User(
        name=pname, username=uname, email=email,
        password_hash=hash_password("demo1234"),
        country_id=country_map[ciso].id,
        avatar_initial=pname[0].upper(),
        points=800 + len(speaks) * 200,
    )
    db.add(u)
    db.flush()
    for ln in speaks:
        if ln in lang_map:
            db.add(UserLanguage(user_id=u.id, language_id=lang_map[ln].id, role="speaks"))
    for ln in learning:
        if ln in lang_map:
            db.add(UserLanguage(user_id=u.id, language_id=lang_map[ln].id, role="learning"))
    # sample contribution for live feed
    if speaks and speaks[0] in lang_map:
        db.add(Contribution(
            user_id=u.id, language_id=lang_map[speaks[0]].id,
            word=f"Sample from {pname.split()[0]}",
            meaning="Community greeting preserved on Lugha",
            content_type="word", upvotes=5,
        ))


db.commit()
print(f"Seeded {db.query(Country).count()} countries, {db.query(Language).count()} languages, "
      f"{db.query(Badge).count()} badges, {db.query(User).count()} users, "
      f"{db.query(Contribution).count()} contributions.")
db.close()
