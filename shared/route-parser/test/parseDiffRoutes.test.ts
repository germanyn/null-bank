import { describe, it, expect } from 'vitest';
import { parseDiffRoutes } from '../src/index';

describe('parseDiffRoutes', () => {
  describe('basic route extraction', () => {
    it('extracts a single route from a modified file', () => {
      const diff = `diff --git a/apps/shell/src/routes/TransferNew.tsx b/apps/shell/src/routes/TransferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/TransferNew.tsx
+++ b/apps/shell/src/routes/TransferNew.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function TransferNew() {
-  return <div>Old</div>;
+  return <div>New</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/transfer-new']);
    });

    it('extracts multiple routes from a multi-file diff', () => {
      const diff = `diff --git a/apps/shell/src/routes/TransferNew.tsx b/apps/shell/src/routes/TransferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/TransferNew.tsx
+++ b/apps/shell/src/routes/TransferNew.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function TransferNew() {
-  return <div>Old</div>;
+  return <div>New</div>;
 }
diff --git a/apps/shell/src/routes/AccountList.tsx b/apps/shell/src/routes/AccountList.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/AccountList.tsx
+++ b/apps/shell/src/routes/AccountList.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function AccountList() {
-  return <div>Old</div>;
+  return <div>List</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/transfer-new', '/account-list']);
    });
  });

  describe('file extension handling', () => {
    it('handles .tsx extension', () => {
      const diff = `diff --git a/apps/shell/src/routes/Dashboard.tsx b/apps/shell/src/routes/Dashboard.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/Dashboard.tsx
+++ b/apps/shell/src/routes/Dashboard.tsx
@@ -1,3 +1,5 @@
+import React from 'react';
+
 export function Dashboard() {
   return <div>Dashboard</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/dashboard']);
    });

    it('handles .ts extension', () => {
      const diff = `diff --git a/apps/shell/src/routes/auth.ts b/apps/shell/src/routes/auth.ts
index abc1234..def5678 100644
--- a/apps/shell/src/routes/auth.ts
+++ b/apps/shell/src/routes/auth.ts
@@ -1,3 +1,5 @@
+export function login() {
+  return { success: true };
+}
 export function logout() {
   return { success: true };
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/auth']);
    });
  });

  describe('case conversion', () => {
    it('converts PascalCase to kebab-case', () => {
      const diff = `diff --git a/apps/shell/src/routes/TransferNew.tsx b/apps/shell/src/routes/TransferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/TransferNew.tsx
+++ b/apps/shell/src/routes/TransferNew.tsx
@@ -1,3 +1,5 @@
+import React from 'react';
+
 export function TransferNew() {
   return <div>New</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/transfer-new']);
    });

    it('converts camelCase to kebab-case', () => {
      const diff = `diff --git a/apps/shell/src/routes/transferNew.tsx b/apps/shell/src/routes/transferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/transferNew.tsx
+++ b/apps/shell/src/routes/transferNew.tsx
@@ -1,3 +1,5 @@
+import React from 'react';
+
 export function transferNew() {
   return <div>New</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/transfer-new']);
    });

    it('handles single-word filenames', () => {
      const diff = `diff --git a/apps/shell/src/routes/Dashboard.tsx b/apps/shell/src/routes/Dashboard.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/Dashboard.tsx
+++ b/apps/shell/src/routes/Dashboard.tsx
@@ -1,3 +1,5 @@
+import React from 'react';
+
 export function Dashboard() {
   return <div>Dashboard</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/dashboard']);
    });
  });

  describe('edge cases', () => {
    it('ignores deleted files', () => {
      const diff = `diff --git a/apps/shell/src/routes/OldRoute.tsx b/apps/shell/src/routes/OldRoute.tsx
deleted file mode 100644
index abc1234..0000000
--- a/apps/shell/src/routes/OldRoute.tsx
+++ /dev/null
@@ -1,5 +0,0 @@
-import React from 'react';
-
-export function OldRoute() {
-  return <div>Old</div>;
-}`;

      expect(parseDiffRoutes(diff)).toEqual([]);
    });

    it('takes the new name for renamed files', () => {
      const diff = `diff --git a/apps/shell/src/routes/OldName.tsx b/apps/shell/src/routes/NewName.tsx
similarity index 85%
rename from apps/shell/src/routes/OldName.tsx
rename to apps/shell/src/routes/NewName.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/OldName.tsx
+++ b/apps/shell/src/routes/NewName.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function NewName() {
-  return <div>Old</div>;
+  return <div>New</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/new-name']);
    });

    it('ignores non-route files', () => {
      const diff = `diff --git a/apps/shell/src/App.tsx b/apps/shell/src/App.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/App.tsx
+++ b/apps/shell/src/App.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function App() {
-  return <div>App</div>;
+  return <div>New App</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual([]);
    });

    it('handles a mix of route and non-route changes', () => {
      const diff = `diff --git a/apps/shell/src/App.tsx b/apps/shell/src/App.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/App.tsx
+++ b/apps/shell/src/App.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function App() {
-  return <div>App</div>;
+  return <div>New App</div>;
 }
diff --git a/apps/shell/src/routes/TransferNew.tsx b/apps/shell/src/routes/TransferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/TransferNew.tsx
+++ b/apps/shell/src/routes/TransferNew.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function TransferNew() {
-  return <div>Old</div>;
+  return <div>New</div>;
 }
diff --git a/apps/shell/src/routes/AccountList.tsx b/apps/shell/src/routes/AccountList.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/AccountList.tsx
+++ b/apps/shell/src/routes/AccountList.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function AccountList() {
-  return <div>Old</div>;
+  return <div>List</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual(['/transfer-new', '/account-list']);
    });
  });

  describe('deduplication', () => {
    it('deduplicates routes when the same file appears multiple times', () => {
      const diff = `diff --git a/apps/shell/src/routes/TransferNew.tsx b/apps/shell/src/routes/TransferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/TransferNew.tsx
+++ b/apps/shell/src/routes/TransferNew.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function TransferNew() {
-  return <div>Old</div>;
+  return <div>New</div>;
 }
diff --git a/apps/shell/src/routes/TransferNew.tsx b/apps/shell/src/routes/TransferNew.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/routes/TransferNew.tsx
+++ b/apps/shell/src/routes/TransferNew.tsx
@@ -10,5 +15,10 @@
 export function TransferNew() {
   return <div>New</div>;
 }
+export function TransferNewExtra() {
+  return <div>Extra</div>;
+ }`;

      expect(parseDiffRoutes(diff)).toEqual(['/transfer-new']);
    });
  });

  describe('empty input', () => {
    it('returns empty array for empty string', () => {
      expect(parseDiffRoutes('')).toEqual([]);
    });

    it('returns empty array for diff with no route changes', () => {
      const diff = `diff --git a/apps/shell/src/App.tsx b/apps/shell/src/App.tsx
index abc1234..def5678 100644
--- a/apps/shell/src/App.tsx
+++ b/apps/shell/src/App.tsx
@@ -1,5 +1,10 @@
+import React from 'react';
+
 export function App() {
-  return <div>App</div>;
+  return <div>New App</div>;
 }`;

      expect(parseDiffRoutes(diff)).toEqual([]);
    });
  });
});
