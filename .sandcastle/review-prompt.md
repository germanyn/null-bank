# TASK

Review the code changes on branch `{{BRANCH}}` using a two-axis review: **Standards** and **Spec**. Both axes run separately and report side by side.

# CONTEXT

## Branch diff

Run `git diff {{TARGET_BRANCH}}...{{BRANCH}}` to see the full diff of changes.

## Commits on this branch

Run `git log {{TARGET_BRANCH}}..{{BRANCH}} --oneline` to see commits on this branch.

## Issue reference

Pull in the issue context using `gh issue view` or by reading commit messages for issue references (#ID, Closes #ID, etc.).

# AXIS 1: STANDARDS

Does the code conform to this repo's documented coding standards?

## Standards sources

1. `@.sandcastle/CODING_STANDARDS.md` — project-specific conventions
2. The smell baseline below — applies even when a repo documents nothing

**The repo overrides.** A documented repo standard always wins; where it endups something the baseline would flag, suppress the smell.

**Always a judgement call.** Each smell is a labelled heuristic, never a hard violation. Skip anything tooling already enforces.

### Fowler smell baseline

Match each smell against the diff. Read what it is → how to fix:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

# AXIS 2: SPEC

Does the code faithfully implement the originating issue / PRD / spec?

## Spec sources (in order)

1. Issue references in commit messages (`#123`, `Closes #45`, etc.)
2. A PRD or spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature
3. The issue body and comments themselves

If no spec is found, skip this axis and report "no spec available".

# REVIEW PROCESS

1. **Understand the change**: Run the git diff and git log commands above, then read the output to understand the intent.

2. **Check correctness**:
   - Does the implementation match the intent? Are edge cases handled?
   - Are new/changed behaviours covered by tests?
   - Are there unsafe casts, `any` types, or unchecked assumptions?
   - Does the change introduce injection vulnerabilities, credential leaks, or other security issues?

3. **Maintain balance**: Avoid over-simplification that could:
   - Reduce code clarity or maintainability
   - Create overly clever solutions that are hard to understand
   - Combine too many concerns into single functions or components
   - Remove helpful abstractions that improve code organization
   - Make the code harder to debug or extend

4. **Preserve functionality**: Never change what the code does — only how it does it. All original features, outputs, and behaviors must remain intact.

# OUTPUT

Report findings under `## Standards` and `## Spec` headings. Do not merge or rerank findings — the two axes are deliberately separate.

End with a one-line summary: total findings per axis, and the worst issue within each axis (if any). Do not pick a single winner across axes.

# EXECUTION

If you find improvements to make:

1. Make the changes directly on this branch
2. Run tests and type checking to ensure nothing is broken
3. Commit describing the refinements

If the code is already clean and well-structured, do nothing.

Once complete, output <promise>COMPLETE</promise>.
