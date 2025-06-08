window.javaAnalyzer = (() => {
  function analyzeJava(code) {
    const errors = [];
    let fixedCode = code;

    const lines = code.split("\n");

    // Regex for capturing integer division expressions for static check
    const divisionRegex = /(\bint\s+)?(\w+)?\s*=\s*([^;=]+)\s*\/\s*([^;=]+)/;

    // Simple stack to track variable assignments (basic for constants only)
    const constVars = {}; // variableName -> constantNumber

    // Helper to parse integer from string safely
    function parseIntSafe(value) {
      const n = parseInt(value.trim());
      return isNaN(n) ? null : n;
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const lineNum = idx + 1;

      // 1. Missing semicolon (basic)
      if (
        trimmed &&
        !trimmed.startsWith("//") &&
        !trimmed.endsWith(";") &&
        !trimmed.endsWith("{") &&
        !trimmed.endsWith("}") &&
        !trimmed.endsWith(":") 
      ) {
        if (
          /[a-zA-Z0-9_\)\]]/.test(trimmed) &&
          !/^(if|else|for|while|switch|return|throw|try|catch|class|interface|enum|package|import)\b/.test(
            trimmed
          )
        ) {
          errors.push(`Line ${lineNum}: Possible missing semicolon at end of statement.`);
        //   suggestions.push(`Add a semicolon at the end of line ${lineNum}.`);
        }
        // 5. Detect incorrect use of .length on Strings or objects
        if (/\.\s*length\s*[^(\)]/.test(trimmed)) {
          errors.push(`Line ${lineNum}: Possible misuse of '.length'.`);
        //   suggestions.push("Use '.length()' for strings, '.size()' for lists, and '.length' only for arrays.");
        }

      }

      // 2. Track constant integer assignments like: int y = 0;
      const constAssignMatch = trimmed.match(/int\s+(\w+)\s*=\s*(-?\d+)\s*;/);
      if (constAssignMatch) {
        constVars[constAssignMatch[1]] = parseIntSafe(constAssignMatch[2]);
      }

      // 3. Detect division by zero literals or variables known to be zero
      const divisionMatch = trimmed.match(/([^;=]+)\s*\/\s*([^;=]+)/);
      if (divisionMatch) {
        const divisor = divisionMatch[2].trim();
        let divisorValue = null;

        // Check if divisor is a literal zero
        if (divisor === "0") {
          divisorValue = 0;
        } else if (constVars.hasOwnProperty(divisor)) {
          divisorValue = constVars[divisor];
        }

        if (divisorValue === 0) {
          errors.push(`Line ${lineNum}: Division by zero detected (divisor is zero).`);
        //   suggestions.push("Avoid dividing by zero, check divisor before division.");
        }
      }

      // 4. Detect missing '+' in System.out.println and string concatenation errors
      if (trimmed.includes("System.out.println") && !trimmed.includes("+")) {
        // Simple check: after "println(" should be string concat with +
        const printMatch = trimmed.match(/System\.out\.println\((.*)\)/);
        console.log(printMatch);
        if (printMatch && typeof printMatch[1] === "string") {
          const inside = printMatch[1].trim();
          // If there's more than one string literal or expression without '+', suspicious
          if (inside.includes('"') && !inside.includes("+")) {
            errors.push(`Line ${lineNum}: Possibly missing '+' operator in print statement.`);
            // suggestions.push("Check string concatenation in print statement.");
          }
        }
      }
    });

    // Recommendations & checks
    if (/System\.out\.println/.test(code)) {
    //   suggestions.push("For production systems, consider using logging frameworks instead of System.out.println.");
    }

    if (/==/.test(code) && /String/.test(code)) {
    //   suggestions.push("Use .equals() method to compare Strings, '==' compares references not content.");
    }

    if (!/import java\./.test(code) && /Scanner/.test(code)) {
    //   suggestions.push("Missing import statement for java.util.Scanner required for Scanner usage.");
    }

    // Fix missing semicolons by adding them
    fixedCode = lines
      .map((line) => {
        const trimmed = line.trim();
        if (
          trimmed &&
          !trimmed.startsWith("//") &&
          !trimmed.endsWith(";") &&
          !trimmed.endsWith("{") &&
          !trimmed.endsWith("}") &&
          !trimmed.endsWith(":")
        ) {
          if (
            /[a-zA-Z0-9_\)\]]/.test(trimmed) &&
            !/^(if|else|for|while|switch|return|throw|try|catch|class|interface|enum|package|import)\b/.test(
              trimmed
            )
          ) {
            return line + ";";
          }
        }
        return line;
      })
      .join("\n");

    if (errors.length == 0) {
      errors.push("No syntax errors detected.");
    }
    // if (suggestions.length === 0) {
    //   suggestions.push("Code style looks fine.");
    // }

    if (/for\s*\(.+;.+;.+\)/.test(code)) {
    //   suggestions.push(
    //     "Consider using enhanced for-each loops when iterating arrays or collections for better readability."
    //   );
    }
    
    return { errors, fixedCode };
  }

  return { analyzeJava };
})();