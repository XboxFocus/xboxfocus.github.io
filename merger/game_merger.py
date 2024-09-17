import logging
import os
import sys
import json

class Game:
    def __init__(self, name, title_id, vertical_image, horizontal_image, screenshots, square_image, pfn, exe):
        self.name = name
        self.title_id = title_id
        self.vertical_image = vertical_image
        self.horizontal_image = horizontal_image
        self.screenshots = screenshots
        self.square_image = square_image
        self.pfn = pfn
        self.exe = exe

def parse_line(line, existing_names, existing_verticals, index):
    parts = line.strip().split('|')
    if len(parts) < 7:
        logging.warning(f"Line does not have enough parts: {line}")
        return None  # Skip lines that don't have enough parts
    name = parts[0]
    title_id = parts[1]
    vertical_image = parts[2]
    horizontal_image = ""
    screenshots = []
    if '+' in parts[3]:
        images = parts[3].split('+')
        horizontal_image = images[0] if images[0] else ""
        screenshots = images[1:] if len(images) > 1 else []
    else:
        horizontal_image = parts[3]
    square_image = parts[4]
    pfn = parts[5]
    exe = parts[6]

    # Check for duplicate screenshots
    if len(screenshots) != len(set(screenshots)):
        logging.warning(f"Duplicate screenshots found in game {title_id} aka {name}")

    # Check for "?q=" in image URLs
    if "?q=" in vertical_image:
        logging.warning(f"'?q=' found in vertical image URL in game {title_id} aka {name}")
        vertical_image = vertical_image.split("?q=")[0]
    if "?q=" in horizontal_image:
        logging.warning(f"'?q=' found in horizontal image URL in game {title_id} aka {name}")
        horizontal_image = horizontal_image.split("?q=")[0]
    if "?q=" in square_image:
        logging.warning(f"'?q=' found in square image URL in game {title_id} aka {name}")
        square_image = square_image.split("?q=")[0]
    for i, screenshot in enumerate(screenshots):
        if "?q=" in screenshot:
            logging.warning(f"'?q=' found in screenshot URL in game {title_id} aka {name}")
            screenshots[i] = screenshot.split("?q=")[0]

    # Check for PFN and EXE consistency
    if (pfn and not exe) or (not pfn and exe):
        logging.warning(f"Inconsistent PFN and EXE in game {title_id} aka {name}")
        
    if " " in exe:
        logging.warning(f"EXE has a space: {title_id} aka {name}")
        
    if "\\" in exe:
        logging.warning(f"EXE has a backslash: {title_id} aka {name}")
        
    if "." in exe:
        logging.warning(f"[DEBUG] EXE has a dot: {title_id} aka {name}")
        
    if "gdkstub" in exe.strip().lower():
        logging.warning(f"EXE has GDKStub: {title_id} aka {name}")

    if index == 1:
        existing_names.add(name.replace(" ", "").lower())
        existing_verticals.add(vertical_image.strip().lower())
    return Game(name, title_id, vertical_image, horizontal_image, screenshots, square_image, pfn, exe)

def read_file(filename, existing_names, existing_verticals, index):
    games = {}
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                game = parse_line(line, existing_names, existing_verticals, index)
                if game:
                    games[game.title_id] = game
    except Exception as e:
        logging.error(f"Error reading file {filename}: {e}")
    return games

def merge_games(games1, games2, existing_names, existing_verticals):
    for title_id, game in games2.items():
        if any(keyword in game.name.lower() for keyword in [
        "deluxe", "premium", "upgrade", "edition 20", "ultimate edition", "bundle", "pacchetto", "pre-ordine", "preordine", "preorder", "pre-order",
        ]):
            continue  # Skip merging games with "deluxe", "premium", or "upgrade" in the name
        if any(keyword in game.title_id.upper() for keyword in [
        "9PJWT8HKCT99", "9P22JVNVHR4H",
        ]):
            continue
        if title_id in games1:
            existing_game = games1[title_id]
            if not existing_game.name:
                existing_game.name = game.name
            if not existing_game.vertical_image:
                existing_game.vertical_image = game.vertical_image
            if not existing_game.horizontal_image:
                existing_game.horizontal_image = game.horizontal_image
            if not existing_game.screenshots and len(game.screenshots) > 0:
                existing_game.screenshots = game.screenshots
            if not existing_game.square_image:
                existing_game.square_image = game.square_image
            if not existing_game.pfn:
                existing_game.pfn = game.pfn
            if not existing_game.exe:
                existing_game.exe = game.exe
        else:
            games1[title_id] = game
            if game.name.replace(" ", "").lower() in existing_names:
                logging.warning(f"Duplicate name found: {game.name}")
            if game.vertical_image.strip().lower() in existing_verticals:
                logging.warning(f"Duplicate vertical found: {game.name}")
    return games1

def write_file(filename, games):
    sorted_games = sorted(games.values(), key=lambda game: game.name.replace(" ", "").lower())
    try:
        with open(filename, 'w', encoding='utf-8') as file:
            for game in sorted_games:
                screenshots_str = '+' + '+'.join(game.screenshots) if len(game.screenshots) > 0 else ''
                line = f"{game.name}|{game.title_id}|{game.vertical_image}|{game.horizontal_image}{screenshots_str}|{game.square_image}|{game.pfn}|{game.exe}\n"
                file.write(line)
    except Exception as e:
        logging.error(f"Error writing file {filename}: {e}")

def validate_files(file1, file2):
    if not os.path.isfile(file1):
        logging.error(f"File not found: {file1}")
        return False
    if not os.path.isfile(file2):
        logging.error(f"File not found: {file2}")
        return False
    return True

def main(file1, file2, output_file):
    if not validate_files(file1, file2):
        return
    existing_names = set()
    existing_verticals = set()
    games1 = read_file(file1, existing_names, existing_verticals, 1)
    games2 = read_file(file2, existing_names, existing_verticals, 2)
    merged_games = merge_games(games1, games2, existing_names, existing_verticals)
    write_file(output_file, merged_games)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    if len(sys.argv) != 4:
        print("Usage: python game_merger.py <file1> <file2> <output_file>")
    else:
        main(sys.argv[1], sys.argv[2], sys.argv[3])
