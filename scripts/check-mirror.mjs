import { execFileSync } from "node:child_process";

// @nonobvious(must-hold) this uses status rather than `git diff --exit-code`, because diff reports only
// tracked modifications: a newly generated mirror arrives untracked and would pass a diff check silently,
// which is how a docs page ends up with no .md address while llms.txt promises every page has one.
// @nonobvious(must-hold) public/docs.md is named separately because the generator writes the index mirror
// beside the directory rather than inside it, so a pathspec of public/docs alone reports it as clean however
// stale it is
const output = execFileSync(
  "git",
  ["status", "--porcelain", "--", "public/docs", "public/docs.md"],
  { encoding: "utf8" },
);

// @nonobvious(means) the second status column is the worktree against the index, so a file already staged
// with a matching worktree reads as clean here: it is going into the commit, and failing on it would break
// the check for anyone who stages the regenerated mirrors before committing them.
const stale = output
  .split("\n")
  .filter((line) => line.length > 2 && line[1] !== " ");

if (stale.length) {
  console.error(
    "the committed markdown mirrors are out of date with content/docs; run `npm run md` and commit the result:\n",
  );
  for (const line of stale) console.error(`  ${line.trim()}`);
  process.exit(1);
}

console.log("committed markdown mirrors match content/docs");
