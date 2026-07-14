# TASK

Push each completed branch and create a pull request. Dependent issues target the previous PR's branch, forming a stacked chain.

Here are the branches:

{{BRANCHES}}

Here are the issues:

{{ISSUES}}

Here are the dependency edges (which branch each branch targets):

{{DEPENDENCIES}}

# WORKFLOW

For each branch, in dependency order (branches with no dependencies first):

1. **Push the branch** to origin:
   ```
   git push origin <branch>
   ```

2. **Merge the base branch** into this branch (resolve any conflicts, run tests):
   ```
   git checkout <branch>
   git merge <base-branch> --no-edit
   # If there are merge conflicts, resolve them by reading both sides
   # and choosing the correct resolution
   npm run typecheck && npm run test
   # If tests fail, fix the issues before proceeding
   git push origin <branch>
   ```

3. **Create a PR** via `gh pr create` with an auto-generated description:
   ```
   gh pr create --base <base-branch> --head <branch> --title "..." --body "..."
   ```

   The PR title and body should include:
   - The issue ID and title
   - A brief summary of what was implemented
   - A note that this PR is stacked on top of `<base-branch>`

4. **Apply `pending-review` label** to the issue so sandcastle skips it in future runs:
   ```
   gh issue edit <issue-number> --add-label "pending-review"
   ```

# FINAL RULES

- Do NOT close issues — humans close issues when they merge PRs
- Only work on the branches listed above
- Ensure every PR is ready to merge before moving to the next one

Once complete, output <promise>COMPLETE</promise>.
