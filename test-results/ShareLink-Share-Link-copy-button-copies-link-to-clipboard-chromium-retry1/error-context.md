# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ShareLink.spec.ts >> Share Link >> copy button copies link to clipboard
- Location: e2e\ShareLink.spec.ts:29:7

# Error details

```
Error: apiRequestContext._wrapApiCall: ENOENT: no such file or directory, open 'C:\CareFinder\Third-Semester-CapStone-Project\test-results\.playwright-artifacts-25\traces\resources\page@766c89f04be59e4354830965eb5169ee-1780862050948.jpeg'
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "CF Carefinder" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: CF
          - generic [ref=e9]: Carefinder
        - generic [ref=e10]:
          - link "Find Hospitals" [ref=e11] [cursor=pointer]:
            - /url: /search
          - link "Admin" [ref=e12] [cursor=pointer]:
            - /url: /admin/login
    - generic [ref=e14]:
      - search "Search hospitals" [ref=e16]:
        - searchbox "Search hospitals" [ref=e17]: Lagos
        - button "Search" [ref=e18] [cursor=pointer]
      - button "Export CSV" [disabled] [ref=e19]
      - button "Share" [ref=e20] [cursor=pointer]
      - generic [ref=e22]:
        - generic [ref=e23]:
          - heading "Share Results" [level=3] [ref=e24]
          - button "×" [ref=e25] [cursor=pointer]
        - generic [ref=e26]:
          - paragraph [ref=e27]: Shareable Link
          - generic [ref=e28]:
            - textbox [ref=e29]: http://localhost:3000/search?query=Lagos
            - button "Copied!" [active] [ref=e30] [cursor=pointer]
        - generic [ref=e31]:
          - paragraph [ref=e32]: Send via Email
          - textbox "recipient@example.com" [ref=e33]
          - button "Send to 0 hospitals" [disabled] [ref=e34]
      - button "Show Map" [ref=e35] [cursor=pointer]
    - generic [ref=e37]:
      - complementary [ref=e38]:
        - complementary [ref=e39]:
          - heading "Filters" [level=2] [ref=e41]
          - generic [ref=e42]:
            - heading "Ownership" [level=3] [ref=e43]
            - generic [ref=e44]:
              - button "public" [ref=e45] [cursor=pointer]
              - button "private" [ref=e46] [cursor=pointer]
          - generic [ref=e47]:
            - heading "Distance" [level=3] [ref=e48]
            - paragraph [ref=e49]: Enable location to filter by distance
          - generic [ref=e50]:
            - heading "Specialties" [level=3] [ref=e51]
            - generic [ref=e52]:
              - button "emergency" [ref=e53] [cursor=pointer]
              - button "maternity" [ref=e54] [cursor=pointer]
              - button "pediatric" [ref=e55] [cursor=pointer]
              - button "dental" [ref=e56] [cursor=pointer]
              - button "surgery" [ref=e57] [cursor=pointer]
              - button "cardiology" [ref=e58] [cursor=pointer]
              - button "neurology" [ref=e59] [cursor=pointer]
              - button "oncology" [ref=e60] [cursor=pointer]
              - button "ophthalmology" [ref=e61] [cursor=pointer]
              - button "orthopedics" [ref=e62] [cursor=pointer]
              - button "psychiatry" [ref=e63] [cursor=pointer]
              - button "radiology" [ref=e64] [cursor=pointer]
              - button "physiotherapy" [ref=e65] [cursor=pointer]
              - button "dermatology" [ref=e66] [cursor=pointer]
              - button "urology" [ref=e67] [cursor=pointer]
      - generic [ref=e68]:
        - paragraph [ref=e70]: 0 hospitals found
        - generic [ref=e71]:
          - paragraph [ref=e72]: 🏥
          - paragraph [ref=e73]: No hospitals found
          - paragraph [ref=e74]: Try adjusting your search or filters
  - button "Open Next.js Dev Tools" [ref=e80] [cursor=pointer]:
    - img [ref=e81]
  - alert [ref=e84]
```