import importlib.util
import sys
import unittest
from pathlib import Path


def load_module_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load module from {file_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    repo_root = Path(__file__).resolve().parents[1]
    suite = unittest.TestSuite()
    loader = unittest.defaultTestLoader
    test_files = sorted(repo_root.glob("skills/**/test_*.py"))
    if not test_files:
        raise SystemExit("No Python tests were found under skills/.")

    for index, file_path in enumerate(test_files):
        module = load_module_from_path(f"skill_test_{index}", file_path)
        suite.addTests(loader.loadTestsFromModule(module))

    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        sys.exit(1)


if __name__ == "__main__":
    main()
