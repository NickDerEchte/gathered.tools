---
Title: Feed Development
---
[back](..).
@[Video](../data/gatheredtoolsv2.mp4 "autoplay")



## Template
Copy the template below and start to edit it. Add tools by duplicating from "id" to the second last square bracket ( ] ). Remember to add commas to every tool except the last one.
```JSON
{
  "feed-name": "Feed Name",
  "feed-icon": "/url/to/icon.png",
  "feed-author": "Your Name",
  "feed-author-src": "https://yourwebsite.com",
  "updated": "2027-10-07",
  "tooldata-version": "v2",
  "tools": [
    {
      "id": "tool-id",
      "name": "Tool Name",
      "url": "https://tool.com",
      "description": "All your descriptions should have a similar length.",
      "image": "/path/to/thumbnail.png",
      "pricing": "free",
      "highlight":false,
      "tags": [
        "add",
        "tags",
        "here"]
    }
  ]
}
```

## Use your Feed
For the feed to appear in gathered.tools, you need to upload the json on a webserver. Free options are e.g. GitHub. Copy the link to the json (**Note:** You have to use the RAW link to the JSON. It has to end with "../your-file.json".). Visit gathered.tools, click on the settings icon and paste the link into the input field. Click "Add Feed" and wait for the feed to update.

---
(c) 2026 [Nick Figner](https://nickfigner.com/). All rights reserved.
Made with [Nick's Markdown](https://nickfigner.com/nmd).

