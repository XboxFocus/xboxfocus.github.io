import unittest
from game_merger import Game, parse_line, merge_games, write_file

class TestGameFunctions(unittest.TestCase):
    def test_parse_line(self):
        line = "Name|TitleID|VerticalImage|HorizontalImage+Screenshot1+Screenshot2|SquareImage|PFN|EXE"
        game = parse_line(line)
        self.assertIsNotNone(game)
        self.assertEqual(game.name, "Name")
        self.assertEqual(game.title_id, "TitleID")
        self.assertEqual(game.vertical_image, "VerticalImage")
        self.assertEqual(game.horizontal_image, "HorizontalImage")
        self.assertEqual(game.screenshots, ["Screenshot1", "Screenshot2"])
        self.assertEqual(game.square_image, "SquareImage")
        self.assertEqual(game.pfn, "PFN")
        self.assertEqual(game.exe, "EXE")

    def test_merge_games(self):
        game1 = Game("Name1", "TitleID1", "VerticalImage1", "HorizontalImage1", ["Screenshot1"], "SquareImage1", "PFN1", "EXE1")
        game2 = Game("Name2", "TitleID2", "VerticalImage2", "HorizontalImage2", ["Screenshot2"], "SquareImage2", "PFN2", "EXE2")
        games1 = {"TitleID1": game1}
        games2 = {"TitleID2": game2}
        merged_games = merge_games(games1, games2)
        self.assertEqual(len(merged_games), 2)
        self.assertIn("TitleID1", merged_games)
        self.assertIn("TitleID2", merged_games)

    def test_write_file(self):
        game1 = Game("Name1", "TitleID1", "VerticalImage1", "HorizontalImage1", ["Screenshot1"], "SquareImage1", "PFN1", "EXE1")
        games = {"TitleID1": game1}
        write_file("test_output.txt", games)
        with open("test_output.txt", 'r', encoding='utf-8') as file:
            lines = file.readlines()
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0].strip(), "Name1|TitleID1|VerticalImage1|HorizontalImage1+Screenshot1|SquareImage1|PFN1|EXE1")

if __name__ == "__main__":
    unittest.main()
