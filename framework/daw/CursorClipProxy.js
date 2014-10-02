// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CursorClipProxy (stepSize, rowSize, clip)
{
    this.stepSize = stepSize;
    this.rowSize = rowSize;
    this.step = -1;
    this.playStart  = 0.0;
    this.playEnd    = 4.0;
    this.loopStart  = 0.0;
    this.loopLength = 4.0;

    this.data = [];
    for (var y = 0; y < this.rowSize; y++)
        this.data[y] = initArray (false, this.stepSize);

    this.clip = host.createCursorClip (this.stepSize, this.rowSize);
    this.clip.addPlayingStepObserver (doObject (this, CursorClipProxy.prototype.handlePlayingStep));
    this.clip.addStepDataObserver (doObject (this, CursorClipProxy.prototype.handleStepData));
    
    this.clip.getPlayStart ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handlePlayStart));
    this.clip.getPlayStop ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handlePlayStop));
    this.clip.getLoopStart ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handleLoopStart));
    this.clip.getLoopLength ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handleLoopLength));
}

CursorClipProxy.prototype.getPlayStart = function ()
{
    return this.playStart;
};

CursorClipProxy.prototype.setPlayStart = function (start)
{
    return this.clip.getPlayStart ().setRaw (start);
};

CursorClipProxy.prototype.getPlayEnd = function ()
{
    return this.playEnd;
};

CursorClipProxy.prototype.setPlayEnd = function (end)
{
    return this.clip.getPlayStop ().setRaw (end);
};

CursorClipProxy.prototype.getLoopStart = function ()
{
    return this.loopStart;
};

CursorClipProxy.prototype.setLoopStart = function (start)
{
    return this.clip.getLoopStart ().setRaw (start);
};

CursorClipProxy.prototype.getLoopLength = function ()
{
    return this.loopLength;
};

CursorClipProxy.prototype.setLoopLength = function (length)
{
    return this.clip.getLoopLength ().setRaw (length);
};

CursorClipProxy.prototype.getStepSize = function ()
{
    return this.stepSize;
};

CursorClipProxy.prototype.getRowSize = function ()
{
    return this.rowSize;
};

CursorClipProxy.prototype.getCurrentStep = function ()
{
    return this.step;
};

CursorClipProxy.prototype.getStep = function (step, row)
{
    return this.data[step][row];
};

CursorClipProxy.prototype.toggleStep = function (step, row, velocity)
{
    this.clip.toggleStep (step, row, velocity);
};

CursorClipProxy.prototype.setStep = function (step, row, velocity, duration)
{
    this.clip.setStep (step, row, velocity, duration);
};

CursorClipProxy.prototype.clearRow = function (row)
{
    // Since there is no dedicated function, we suggest a maximum of 32 tracks 
    // with a resolution of 64 steps each
    for (var step = 0; step < 64 * 32; step++)
        this.clip.clearStep (step, row);
};

CursorClipProxy.prototype.setStepLength = function (length)
{
    this.clip.setStepSize (length);
};

CursorClipProxy.prototype.scrollTo = function (step, row)
{
    this.clip.scrollToKey (row);
    this.clip.scrollToStep (step);
};

CursorClipProxy.prototype.scrollStepsPageBackwards = function ()
{
    this.clip.scrollStepsPageBackwards ();
};

CursorClipProxy.prototype.scrollStepsPageForward = function ()
{
    this.clip.scrollStepsPageForward ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

CursorClipProxy.prototype.handlePlayingStep = function (step)
{
    this.step = step;
};
    
CursorClipProxy.prototype.handleStepData = function (column, row, state)
{
    this.data[column][row] = state;
};

CursorClipProxy.prototype.handlePlayStart = function (position)
{
    this.playStart = position;
};

CursorClipProxy.prototype.handlePlayStop = function (position)
{
    this.playEnd = position;
};

CursorClipProxy.prototype.handleLoopStart = function (position)
{
    this.loopStart = position;
};

CursorClipProxy.prototype.handleLoopLength = function (position)
{
    this.loopLength = position;
};
