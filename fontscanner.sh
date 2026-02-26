#!/bin/bash
# Generate fonts index.json only

OUTPUT="indexfont.json"
FONT_DIR="fonts"

echo "{" > "$OUTPUT"
echo '  "fonts": [' >> "$OUTPUT"

first=1
while IFS= read -r file; do
  [[ $first -eq 1 ]] && first=0 || echo "," >> "$OUTPUT"
  echo -n "    \"$file\"" >> "$OUTPUT"
done < <(find "$FONT_DIR" -type f -name "*.woff2" | sort)

echo "" >> "$OUTPUT"
echo "  ]" >> "$OUTPUT"
echo "}" >> "$OUTPUT"

echo "index.json generated!"
