---
name: blog-to-linkedin
description: Monitor https://blog.adoestreito.com/ for new articles. When a post is published, extract the content and draft a professional LinkedIn post summarizing the key points.
license: Apache-2.0
metadata:
  author: Andres
  version: "1.0"
---

Monitor https://blog.adoestreito.com/ by doing:
``` curl https://blog.adoestreito.com/posts.json | tail ```
Compare the output with the file: ./references/posts.json

If there is a new post, update ./references/posts.json

Now, with the latest post, craft a linkedin post. The post should not be too marketing/sales type but a professional and well written translation of the original post. You can create two versions: the normal one and one that may go viral.

Store both versions as individual .md files in the "./Linkedin-Posts" directory.