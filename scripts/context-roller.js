#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ContextRoller {
  constructor() {
    this.maxLines = 500;
    this.warningThreshold = 450;
    this.contextPath = '.ai/CONTEXT.md';
    this.archivePath = '.ai/archives';
    this.decisionsPath = '.ai/DECISIONS.md';
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync('.ai')) {
      fs.mkdirSync('.ai');
    }
    if (!fs.existsSync(this.archivePath)) {
      fs.mkdirSync(this.archivePath, { recursive: true });
    }
  }

  async run() {
    try {
      const lines = await this.countLines(this.contextPath);
      console.log(`📊 Current context: ${lines}/${this.maxLines} lines`);
      
      if (lines >= this.maxLines) {
        console.log('🔄 Rolling context...');
        await this.archiveContext();
        await this.createNewContext();
      } else if (lines >= this.warningThreshold) {
        console.log(`⚠️  Warning: Context approaching limit (${lines}/${this.maxLines})`);
        console.log('   Consider wrapping up current session.');
      } else {
        await this.updateLineCount(lines);
        console.log('✅ Context within limits');
      }
      
      // Show current status
      this.showStatus(lines);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  async countLines(filepath) {
    if (!fs.existsSync(filepath)) {
      console.log('📝 Creating initial CONTEXT.md...');
      await this.createNewContext();
      return 1;
    }

    return new Promise((resolve, reject) => {
      let lineCount = 0;
      const stream = readline.createInterface({
        input: fs.createReadStream(filepath),
        crlfDelay: Infinity
      });

      stream.on('line', () => lineCount++);
      stream.on('close', () => resolve(lineCount));
      stream.on('error', reject);
    });
  }

  async archiveContext() {
    const content = fs.readFileSync(this.contextPath, 'utf-8');
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveNumber = await this.getNextArchiveNumber(timestamp);
    const archiveName = `CONTEXT-${timestamp}-${String(archiveNumber).padStart(2, '0')}.md`;
    const archivePath = path.join(this.archivePath, archiveName);
    
    // Extract session number from content
    const sessionMatch = content.match(/Session: #(\d+)/);
    const sessionNumber = sessionMatch ? sessionMatch[1] : 'unknown';
    
    // Create archive with metadata
    const archiveContent = `# Archived Context
Archived: ${new Date().toISOString()}
Original Sessions: #${sessionNumber}
Lines: ${await this.countLines(this.contextPath)}

---

${content}`;
    
    fs.writeFileSync(archivePath, archiveContent);
    console.log(`✅ Archived to ${archiveName}`);
    
    return { archiveName, sessionNumber };
  }

  async createNewContext() {
    const sessionNumber = await this.getNextSessionNumber();
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    const timeStr = timestamp.split('T')[1].substring(0, 5);
    
    const template = `# Active Context 
Lines: 1/500 | Started: ${dateStr} ${timeStr} | Session: #${String(sessionNumber).padStart(3, '0')}

## 🔗 Context Chain
Current: #${String(sessionNumber).padStart(3, '0')} | Previous: #${String(sessionNumber - 1).padStart(3, '0')} (archived) | Next: #${String(sessionNumber + 1).padStart(3, '0')}

## 🎯 Current Focus
\`\`\`yaml
session_id: session-${dateStr}-${String(sessionNumber).padStart(3, '0')}
working_on: [Continued from previous session]
started_at: ${timestamp}
lines_count: 1/500

critical_context:
  - Check DECISIONS.md for permanent rules
  - Review previous archive if needed
\`\`\`

## 📝 Session Log (자동 롤링)

### [${timeStr}] Context Rolled
- Previous context archived
- Starting fresh session #${String(sessionNumber).padStart(3, '0')}
- Ready for new work

## 🚨 Active Issues
[Carry over from previous if needed]

## 🔄 Next Actions
[Carry over from previous if needed]

---
[Auto-archive at 500 lines → CONTEXT-${dateStr}-XX.md]`;

    fs.writeFileSync(this.contextPath, template);
    console.log(`✅ Created new CONTEXT.md (Session #${sessionNumber})`);
  }

  async getNextArchiveNumber(dateStr) {
    const files = fs.readdirSync(this.archivePath);
    const pattern = new RegExp(`CONTEXT-${dateStr}-(\\d+)\\.md`);
    let maxNumber = 0;
    
    files.forEach(file => {
      const match = file.match(pattern);
      if (match) {
        maxNumber = Math.max(maxNumber, parseInt(match[1]));
      }
    });
    
    return maxNumber + 1;
  }

  async getNextSessionNumber() {
    // Check current CONTEXT.md
    if (fs.existsSync(this.contextPath)) {
      const content = fs.readFileSync(this.contextPath, 'utf-8');
      const match = content.match(/Session: #(\d+)/);
      if (match) {
        return parseInt(match[1]) + 1;
      }
    }
    
    // Check archives
    const files = fs.readdirSync(this.archivePath);
    let maxSession = 0;
    
    files.forEach(file => {
      const content = fs.readFileSync(path.join(this.archivePath, file), 'utf-8');
      const match = content.match(/Sessions: #(\d+)/);
      if (match) {
        maxSession = Math.max(maxSession, parseInt(match[1]));
      }
    });
    
    return maxSession + 1;
  }

  async updateLineCount(lines) {
    const content = fs.readFileSync(this.contextPath, 'utf-8');
    const updated = content.replace(
      /Lines: \d+\/500/,
      `Lines: ${lines}/500`
    ).replace(
      /lines_count: \d+\/500/,
      `lines_count: ${lines}/500`
    );
    
    if (content !== updated) {
      fs.writeFileSync(this.contextPath, updated);
    }
  }

  showStatus(lines) {
    console.log('\n📈 Context Status:');
    console.log('─'.repeat(40));
    
    const percentage = Math.round((lines / this.maxLines) * 100);
    const barLength = 30;
    const filledLength = Math.round((lines / this.maxLines) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    console.log(`Progress: [${bar}] ${percentage}%`);
    console.log(`Lines:    ${lines}/${this.maxLines}`);
    
    if (lines < 300) {
      console.log('Status:   🟢 Healthy');
    } else if (lines < this.warningThreshold) {
      console.log('Status:   🟡 Monitor');
    } else {
      console.log('Status:   🔴 Near limit');
    }
    
    // List recent archives
    const archives = fs.readdirSync(this.archivePath).sort().slice(-3);
    if (archives.length > 0) {
      console.log('\n📚 Recent Archives:');
      archives.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
  }
}

// Run if called directly
if (require.main === module) {
  const roller = new ContextRoller();
  roller.run();
}

module.exports = ContextRoller;