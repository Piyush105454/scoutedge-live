import subprocess
import sys
import os

def run_tests():
    print("\033[94m" + "="*50)
    print("SCOUTEDGE MASTER TEST RUNNER")
    print("="*50 + "\033[0m")
    
    # Run pytest and capture output
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "--verbose", "tests/"],
        capture_output=True,
        text=True
    )
    
    # Process output
    lines = result.stdout.split('\n')
    passed = 0
    failed = 0
    failed_details = []
    
    for line in lines:
        if "PASSED" in line:
            passed += 1
        elif "FAILED" in line:
            failed += 1
            failed_details.append(line)
            
    total = passed + failed
    
    # Print Summary to Terminal
    print("\033[92m" if failed == 0 and total > 0 else "\033[91m")
    print(f"TOTAL TESTS: {total}")
    print(f"PASSED: {passed}/{total}")
    print(f"FAILED: {failed}/{total}")
    print("\033[0m")
    
    if failed > 0:
        print("\033[93mFailed Tests Details:\033[0m")
        for detail in failed_details:
            print(f" - {detail}")
            
    # Save to test_report.txt with UTF-8 encoding
    with open("test_report.txt", "w", encoding="utf-8") as f:
        f.write("SCOUTEDGE TEST REPORT\n")
        f.write("="*30 + "\n")
        f.write(f"TOTAL: {total}\n")
        f.write(f"PASSED: {passed}\n")
        f.write(f"FAILED: {failed}\n\n")
        if failed > 0:
            f.write("FAILED TESTS:\n")
            for detail in failed_details:
                f.write(f"- {detail}\n")
        f.write("\nFULL LOG:\n")
        f.write(result.stdout)
        f.write("\nERRORS:\n")
        f.write(result.stderr)
        
    print(f"\033[94mReport saved to test_report.txt\033[0m")

if __name__ == "__main__":
    run_tests()
