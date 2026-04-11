#!/usr/bin/env ruby
# fix_frontmatter.rb
#
# Iterates over every Markdown file in _posts/ and:
#   1. Checks if a 'description' field exists in YAML front matter.
#      If missing, generates one from the first 150 characters of the body.
#   2. Ensures 'layout' is set to 'posts/post' for consistent
#      Venture Partner branding.
#
# Files are only written to disk when a change is actually needed.
# A summary report is printed when the script finishes.

require 'yaml'
require 'date'

POSTS_DIR      = File.join(__dir__, '_posts')
CORRECT_LAYOUT = 'posts/post'
DESC_LENGTH    = 150

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def strip_markdown(text)
  text
    .gsub(/^#+\s+/, '')          # headings
    .gsub(/!\[.*?\]\(.*?\)/, '') # images
    .gsub(/\[([^\]]+)\]\([^)]+\)/, '\1') # links → anchor text
    .gsub(/[*_`~>]/, '')         # emphasis, code, blockquotes
    .gsub(/\{[^}]*\}/, '')       # liquid / HTML attributes
    .gsub(/<[^>]+>/, '')         # HTML tags
    .gsub(/\r\n?/, ' ')          # line breaks → space
    .gsub(/\s+/, ' ')            # collapse whitespace
    .strip
end

def generate_description(body)
  clean = strip_markdown(body)
  # Skip leading underscores like "_Estimated reading time…_"
  clean = clean.sub(/\A_[^_]{0,60}_\s*/, '')
  clean = clean.strip
  clean.length > DESC_LENGTH ? clean[0, DESC_LENGTH].rstrip + '…' : clean
end

def parse_file(path)
  raw = File.read(path, encoding: 'utf-8')

  # Must start with YAML front matter delimited by ---
  unless raw.start_with?('---')
    return { front_matter: nil, body: raw, raw: raw }
  end

  # Find the closing --- (second occurrence)
  close_idx = raw.index("\n---", 3)
  return { front_matter: nil, body: raw, raw: raw } if close_idx.nil?

  yaml_str = raw[3, close_idx - 3]
  body     = raw[close_idx + 4..]&.lstrip || ''

  begin
    fm = YAML.safe_load(yaml_str, permitted_classes: [Date, Time]) || {}
  rescue Psych::Exception => e
    puts "  [WARN] YAML parse error in #{File.basename(path)}: #{e.message}"
    fm = {}
  end

  { front_matter: fm, body: body, yaml_str: yaml_str, raw: raw }
end

def rebuild_file(fm, body)
  yaml_out = YAML.dump(fm).sub(/\A---\n/, '')  # YAML.dump adds leading ---
  "---\n#{yaml_out}---\n#{body}"
end

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

unless Dir.exist?(POSTS_DIR)
  abort "ERROR: _posts/ directory not found at #{POSTS_DIR}"
end

files = Dir.glob(File.join(POSTS_DIR, '*.{md,markdown}'))
abort "No Markdown files found in #{POSTS_DIR}" if files.empty?

puts "=" * 65
puts "  Front Matter Fixer — #{files.size} file(s) in _posts/"
puts "=" * 65

updated_layout = []
updated_desc   = []
already_ok     = []
skipped        = []

files.sort.each do |path|
  filename = File.basename(path)
  parsed   = parse_file(path)

  if parsed[:front_matter].nil?
    puts "  [SKIP] #{filename} — no valid front matter"
    skipped << filename
    next
  end

  fm      = parsed[:front_matter]
  body    = parsed[:body]
  changed = false
  changes = []

  # ── 1. Layout ───────────────────────────────────────────────────────────
  unless fm['layout'] == CORRECT_LAYOUT
    fm['layout'] = CORRECT_LAYOUT
    changed = true
    changes << "layout → #{CORRECT_LAYOUT}"
    updated_layout << filename
  end

  # ── 2. Description ──────────────────────────────────────────────────────
  if fm['description'].nil? || fm['description'].to_s.strip.empty?
    desc = generate_description(body)
    if desc.empty?
      puts "  [WARN] #{filename} — body is empty, skipping description"
    else
      fm['description'] = desc
      changed = true
      changes << "description generated (#{desc.length} chars)"
      updated_desc << filename
    end
  end

  # ── Write if changed ────────────────────────────────────────────────────
  if changed
    new_content = rebuild_file(fm, body)
    File.write(path, new_content, encoding: 'utf-8')
    puts "  [UPDATED] #{filename}"
    changes.each { |c| puts "            ↳ #{c}" }
  else
    already_ok << filename
  end
end

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

puts "\n" + "=" * 65
puts "  SUMMARY"
puts "=" * 65
puts "  Total files      : #{files.size}"
puts "  Already correct  : #{already_ok.size}"
puts "  Layout fixed     : #{updated_layout.size}"
puts "  Description added: #{updated_desc.size}"
puts "  Skipped (no FM)  : #{skipped.size}"
puts "=" * 65

if updated_layout.size + updated_desc.size > 0
  puts "\n  Files modified: #{(updated_layout + updated_desc).uniq.size}"
  puts "\n  Run 'bundle exec jekyll build' to rebuild the site."
else
  puts "\n  All files are already up to date. No changes made."
end

puts
