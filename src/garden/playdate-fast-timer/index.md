---
title: Playdate fast timer
tags: garden
layout: garden
status: seedling
planted: 2023-11-21 17:51:16
tended: 2023-11-21 17:51:16
---


```lua
import("CoreLibs/timer")
import("timer")
import("CoreLibs/utilities/sampler")

function runTest()
  local iterations = 1000

  playbit.timer.removeAll()
  local pdTimers = playdate.timer.allTimers()
  for i = 1, #pdTimers do
    pdTimers[i]:remove()
  end
  playdate.timer.updateTimers()

  local startTime = playdate.getCurrentTimeMilliseconds()
  for i = 1, 100 do
    playbit.timer.new(1500)
  end
  local endTime = playdate.getCurrentTimeMilliseconds()
  print("playbit.new="..(endTime - startTime).."ms")

  local startTime = playdate.getCurrentTimeMilliseconds()
  for i = 1, 100 do
    playdate.timer.new(1500)
  end
  local endTime = playdate.getCurrentTimeMilliseconds()
  print("playdate.new="..(endTime - startTime).."ms")

  local startTime = playdate.getCurrentTimeMilliseconds()
  for i = 1, 10 do
    playbit.timer.update(0.33)
  end
  local endTime = playdate.getCurrentTimeMilliseconds()
  print("playbit.update="..(endTime - startTime).."ms")

  local startTime = playdate.getCurrentTimeMilliseconds()
  for i = 1, 10 do
    playdate.timer.updateTimers()
  end
  local endTime = playdate.getCurrentTimeMilliseconds()
  print("playdate.update="..(endTime - startTime).."ms")
end

local timer = playbit.timer.new(250)
local lastTime = 0
function playdate.update()
  if not timer[playbit.timer.IND_COMPLETE] then
    print("timer", timer[playbit.timer.IND_TIME], timer[playbit.timer.IND_VALUE])
  end
  local time = playdate.getCurrentTimeMilliseconds()
  local dt = time - lastTime
  lastTime = time
  playbit.timer.update(dt)

  if playdate.buttonJustPressed("a") then
    print("START")
    runTest()
    print("END")
  end
end
```