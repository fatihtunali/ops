# Safe Way to Restart Backend Server

## ⚠️ NEVER use `taskkill /F /IM node.exe` - it kills ALL node processes including Claude Code!

## ✅ Safe Method to Restart Server on Windows:

### Step 1: Find the process on port 5000
```bash
netstat -ano | findstr :5000
```

### Step 2: Kill only that specific PID
```bash
cmd //c taskkill //PID <PID_NUMBER> //F
```

### Step 3: Start the server
```bash
cd backend && npm start
```

## Example:
```bash
# Find process
netstat -ano | findstr :5000
# Output: TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    16532

# Kill that specific PID (16532 in this example)
cmd //c taskkill //PID 16532 //F

# Start server
cd backend && npm start
```

## One-Line Command:
```bash
for /f "tokens=5" %a in ('netstat -ano ^| findstr :5000') do cmd //c taskkill //PID %a //F
```
