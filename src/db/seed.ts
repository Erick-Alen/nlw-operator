import { faker } from "@faker-js/faker";
import { db } from "./index";
import { issues } from "./schema/issues";
import { submissions } from "./schema/submissions";
import { diffLines, suggestedFixes } from "./schema/suggested-fixes";

// ── Code snippet templates by language ──

const codeSnippets: Record<string, string[]> = {
  javascript: [
    'eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol',
    "var x = new Array()\nfor (var i = 0; i < arr.length; i++) {\n  x.push(arr[i])\n}\nreturn x",
    'function add(a, b) {\n  return parseInt(a) + parseInt(b)\n}\nconsole.log(add("1", "2"))',
    'document.getElementById("btn").onclick = function() {\n  document.getElementById("out").innerHTML = document.getElementById("in").value\n}',
    "try {\n  JSON.parse(userInput)\n} catch(e) {\n  // it's fine\n}",
    'setTimeout(function() {\n  for(var i=0;i<100;i++){\n    document.body.innerHTML+="<div>"+i+"</div>"\n  }\n}, 0)',
    'var password = "admin123"\nif (input == password) {\n  window.location = "/dashboard"\n}',
    "function isEven(n) {\n  if (n === 0) return true\n  if (n === 1) return false\n  return isEven(n - 2)\n}",
  ],
  typescript: [
    "const eData = (d: any) => {\n  let data2:any[]=[];(d as any).forEach((v:any)=>{\n    data2.push(v)\n  });return data2\n}",
    "if (a == true) { return true; }\nelse if (a == false) { return false; }\nelse { return false; }",
    "const fetchData = async (url: any) => {\n  const res: any = await fetch(url as any)\n  const data: any = await res.json()\n  return data as any\n}",
    "interface User {\n  [key: string]: any\n}\nconst getUser = (id: any): any => {\n  return db.query(`SELECT * FROM users WHERE id = ${id}`)\n}",
    "type Props = {\n  cb: Function\n  data: Object\n  items: Array<any>\n}\nexport const Component = (props: any) => {\n  return <div>{props.children}</div>\n}",
    "class ApiService {\n  private static instance: any\n  getData() { return this.http.get('/api') as any }\n  postData(d: any) { return this.http.post('/api', d) as any }\n}",
  ],
  python: [
    "import os\nos.system(input('Enter command: '))",
    "def fibonacci(n):\n  if n == 1:\n    return 1\n  if n == 2:\n    return 1\n  return fibonacci(n-1) + fibonacci(n-2)",
    "data = []\nfor i in range(len(items)):\n  for j in range(len(items)):\n    if items[i] == items[j] and i != j:\n      data.append(items[i])\nreturn list(set(data))",
    'password = "secret123"\ndb.execute(f"SELECT * FROM users WHERE pass = \'{password}\'")',
    "try:\n  result = do_something()\nexcept:\n  pass",
    "class God:\n  def __init__(self):\n    self.db = Database()\n    self.cache = Redis()\n    self.mailer = SMTP()\n    self.logger = Logger()\n    self.auth = Auth()\n    self.payment = Stripe()\n    self.queue = RabbitMQ()",
  ],
  sql: [
    "SELECT * FROM users WHERE id=$1\n  -- TODO: add authentication",
    "DELETE FROM orders;\n-- oops wrong database",
    "SELECT * FROM users WHERE name LIKE '%' + @input + '%'",
    "UPDATE accounts SET balance = balance - 100 WHERE id = 1;\n-- no transaction lol\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;",
    "SELECT u.*, o.*, p.*, r.*\nFROM users u, orders o, products p, reviews r\nWHERE u.id = o.user_id",
  ],
  java: [
    "catch (e) {\n  // ignore\n}\n\npublic void doStuff() {\n  // TODO\n}",
    'public String processData(Object data) {\n  return ((String)((Map)((List)data).get(0)).get("value")).trim();\n}',
    "public boolean isPositive(int n) {\n  if (n > 0) {\n    return true;\n  } else if (n <= 0) {\n    return false;\n  } else {\n    return false;\n  }\n}",
    'public void connect() {\n  Connection conn = DriverManager.getConnection(\n    "jdbc:mysql://prod-db:3306/app",\n    "root",\n    "password123"\n  );\n}',
  ],
  go: [
    'func handler(w http.ResponseWriter, r *http.Request) {\n  body, _ := ioutil.ReadAll(r.Body)\n  db.Exec(fmt.Sprintf("INSERT INTO logs VALUES (\'%s\')", body))\n  w.Write([]byte("ok"))\n}',
    "func processItems(items []interface{}) interface{} {\n  result := make([]interface{}, 0)\n  for _, item := range items {\n    result = append(result, item.(map[string]interface{}))\n  }\n  return result\n}",
    'if err != nil {\n  fmt.Println("error:", err)\n}\nif err != nil {\n  log.Fatal(err)\n}\nif err != nil {\n  panic(err)\n}',
  ],
  rust: [
    "fn main() {\n  let data: Vec<Box<dyn Any>> = vec![];\n  unsafe {\n    let ptr = data.as_ptr();\n    // trust me bro\n    std::ptr::write(ptr as *mut i32, 42);\n  }\n}",
    "fn process(input: &str) -> String {\n  input.to_string().clone().to_owned().as_str().to_string()\n}",
  ],
};

const languages = Object.keys(codeSnippets);

// ── Issue templates by severity ──

const issueTemplates: Record<string, { title: string; description: string }[]> =
  {
    critical: [
      {
        title: "SQL injection vulnerability",
        description:
          "string interpolation in SQL queries allows attackers to execute arbitrary SQL. use parameterized queries instead.",
      },
      {
        title: "hardcoded credentials",
        description:
          "passwords and secrets must never be committed to source code. use environment variables or a secret manager.",
      },
      {
        title: "eval() with user input",
        description:
          "eval() executes arbitrary code. this is a remote code execution vulnerability waiting to happen.",
      },
      {
        title: "missing input validation",
        description:
          "user input is used directly without any sanitization or validation. this opens the door to injection attacks.",
      },
      {
        title: "unhandled error swallows failures",
        description:
          "empty catch blocks hide errors silently. at minimum log the error. silent failures are the worst kind of bugs.",
      },
      {
        title: "unsafe type casting",
        description:
          "blindly casting without type guards will crash at runtime. validate the shape of your data before casting.",
      },
      {
        title: "missing authentication check",
        description:
          "this endpoint has no auth guard. anyone with the URL can access sensitive data or trigger actions.",
      },
      {
        title: "race condition in concurrent writes",
        description:
          "multiple operations without a transaction or lock can corrupt data when requests overlap.",
      },
    ],
    warning: [
      {
        title: "excessive use of any",
        description:
          "using 'any' defeats the purpose of typescript. define proper interfaces for type safety.",
      },
      {
        title: "imperative loop pattern",
        description:
          "for loops are verbose and error-prone. use .map(), .filter(), or .reduce() for cleaner functional transformations.",
      },
      {
        title: "loose equality operator",
        description:
          "using == instead of === can lead to unexpected type coercion. always use strict equality.",
      },
      {
        title: "var instead of const/let",
        description:
          "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
      },
      {
        title: "god object anti-pattern",
        description:
          "this class does too many things. split responsibilities into focused, single-purpose modules.",
      },
      {
        title: "magic numbers",
        description:
          "unexplained numeric literals make code hard to understand. extract them into named constants.",
      },
      {
        title: "callback hell",
        description:
          "deeply nested callbacks are hard to read and debug. refactor to async/await or promise chains.",
      },
      {
        title: "redundant boolean logic",
        description:
          "checking if a boolean equals true/false is redundant. just use the boolean directly.",
      },
      {
        title: "SELECT * in queries",
        description:
          "fetching all columns wastes bandwidth and leaks data. always specify the columns you need.",
      },
    ],
    good: [
      {
        title: "descriptive variable names",
        description:
          "clear naming communicates intent without needing comments. this makes the code self-documenting.",
      },
      {
        title: "single responsibility",
        description:
          "the function does one thing well — no side effects, no mixed concerns, no hidden complexity.",
      },
      {
        title: "proper error handling",
        description:
          "errors are caught, logged, and propagated correctly. this makes debugging in production much easier.",
      },
      {
        title: "immutable data patterns",
        description:
          "using const and avoiding mutations prevents entire classes of bugs. good discipline.",
      },
    ],
  };

// ── Roast quote templates ──

const roastQuotes = [
  "this code was written during a power outage... in 2005.",
  "if spaghetti code had a LinkedIn, this would be its profile pic.",
  "I've seen better error handling in a microwave manual.",
  "this is what happens when you copy from Stack Overflow with your eyes closed.",
  "the only thing this code catches is regret.",
  "somewhere, a CS professor just felt a disturbance in the force.",
  "this code doesn't just have bugs — it's a nature preserve.",
  "even the linter gave up halfway through.",
  "this code runs on hopes, prayers, and setTimeout.",
  "I've seen more structure in a plate of ramen.",
  "this is not code. this is a cry for help.",
  "the variable names alone should be a war crime.",
  "impressive — you managed to violate every SOLID principle in 5 lines.",
  "did you write this to get fired? because it would work.",
  "this function has more side effects than a pharmaceutical ad.",
  "congratulations, you invented a new type of technical debt.",
  "the only pattern here is pain.",
  "this code is the reason we have code reviews.",
  "it works, but so does duct tape on a spaceship.",
  "your future self is going to hate you for this.",
  "actually decent — someone's been reading the docs.",
  "clean, readable, and it works. who are you?",
  "this is solid work. the bar is low, but you cleared it.",
  "not bad at all. a few tweaks and this is production-ready.",
  "honestly? I've seen senior devs write worse.",
];

// ── Helpers ──

type Verdict =
  | "mass_disaster"
  | "needs_serious_help"
  | "barely_acceptable"
  | "decent_enough"
  | "actually_good"
  | "mass_respect";

function scoreToVerdict(score: number): Verdict {
  if (score <= 2.0) {
    return "mass_disaster";
  }
  if (score <= 4.0) {
    return "needs_serious_help";
  }
  if (score <= 6.0) {
    return "barely_acceptable";
  }
  if (score <= 8.0) {
    return "decent_enough";
  }
  if (score <= 9.5) {
    return "actually_good";
  }
  return "mass_respect";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIssues(score: number) {
  const count = faker.number.int({ min: 2, max: 5 });
  const result: {
    severity: "critical" | "warning" | "good";
    title: string;
    description: string;
    sortOrder: number;
  }[] = [];

  for (let i = 0; i < count; i++) {
    let severity: "critical" | "warning" | "good";
    if (score <= 3) {
      severity = pickRandom(["critical", "critical", "warning"]);
    } else if (score <= 6) {
      severity = pickRandom(["critical", "warning", "warning"]);
    } else {
      severity = pickRandom(["warning", "good", "good"]);
    }

    const template = pickRandom(issueTemplates[severity]);
    result.push({ ...template, severity, sortOrder: i });
  }

  return result;
}

// ── Seed ──

const MOCK_COUNT = 50;

async function seed() {
  console.log("Seeding database...");

  // Clean existing data (order matters for FK constraints)
  await db.delete(diffLines);
  await db.delete(suggestedFixes);
  await db.delete(issues);
  await db.delete(submissions);

  let totalIssues = 0;
  let totalFixes = 0;
  let totalDiffLines = 0;

  for (let i = 0; i < MOCK_COUNT; i++) {
    const language = pickRandom(languages);
    const code = pickRandom(codeSnippets[language]);
    const lineCount = code.split("\n").length;
    const score = Number.parseFloat(
      faker.number.float({ min: 0.5, max: 9.8, fractionDigits: 1 }).toFixed(1)
    );
    const verdict = scoreToVerdict(score);
    const roastMode = pickRandom(["honest", "roast"] as const);

    const [entry] = await db
      .insert(submissions)
      .values({
        code,
        language,
        lineCount,
        roastMode,
        score: score.toString(),
        verdict,
        roastQuote: pickRandom(roastQuotes),
        shareToken: faker.string.nanoid(10),
        createdAt: faker.date.recent({ days: 30 }),
      })
      .returning();

    // Issues
    const entryIssues = generateIssues(score);
    await db.insert(issues).values(
      entryIssues.map((issue) => ({
        submissionId: entry.id,
        ...issue,
      }))
    );
    totalIssues += entryIssues.length;

    // ~40% chance of having a suggested fix
    if (faker.datatype.boolean({ probability: 0.4 })) {
      const ext =
        language === "python"
          ? "py"
          : language === "rust"
            ? "rs"
            : language === "go"
              ? "go"
              : language === "java"
                ? "java"
                : language === "sql"
                  ? "sql"
                  : "ts";

      const [fix] = await db
        .insert(suggestedFixes)
        .values({
          submissionId: entry.id,
          headerLabel: `file.${ext} → file.${ext}`,
        })
        .returning();

      const lines = code.split("\n");
      const diffLineValues: {
        suggestedFixId: string;
        type: "added" | "removed" | "context";
        content: string;
        sortOrder: number;
      }[] = [];

      let order = 0;

      // context line
      diffLineValues.push({
        suggestedFixId: fix.id,
        type: "context",
        content: `// ${language} refactor`,
        sortOrder: order++,
      });

      // removed lines (original code)
      for (const line of lines) {
        diffLineValues.push({
          suggestedFixId: fix.id,
          type: "removed",
          content: line,
          sortOrder: order++,
        });
      }

      // added lines (faker placeholder improvements)
      const addedCount = faker.number.int({
        min: 1,
        max: lines.length + 2,
      });
      for (let j = 0; j < addedCount; j++) {
        diffLineValues.push({
          suggestedFixId: fix.id,
          type: "added",
          content: `// improved: ${faker.hacker.phrase()}`,
          sortOrder: order++,
        });
      }

      // trailing context
      diffLineValues.push({
        suggestedFixId: fix.id,
        type: "context",
        content: "",
        sortOrder: order++,
      });

      await db.insert(diffLines).values(diffLineValues);
      totalFixes++;
      totalDiffLines += diffLineValues.length;
    }
  }

  console.log("Seed complete!");
  console.log(`  ${MOCK_COUNT} submissions`);
  console.log(`  ${totalIssues} issues`);
  console.log(
    `  ${totalFixes} suggested fixes with ${totalDiffLines} diff lines`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
