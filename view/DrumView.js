// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DrumView.NUM_DISPLAY_COLS = 32;
DrumView.DRUM_START_KEY = 36;

function DrumView (model)
{
    AbstractSequencerView.call (this, model, 128, DrumView.NUM_DISPLAY_COLS);
    this.offsetY = DrumView.DRUM_START_KEY;
    this.canScrollUp = false;
    this.canScrollDown = false;
    this.pads = initArray ({ exists: false, solo: false, mute: false }, 16);
    this.selectedPad = 0;
    this.pressedKeys = initArray (0, 128);
    this.noteMap = this.scales.getEmptyMatrix ();

    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes send from the sequencer
        this.pressedKeys[note] = pressed ? velocity : 0;
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));
}
DrumView.prototype = new AbstractSequencerView ();

DrumView.prototype.updateArrows = function ()
{
    this.canScrollLeft = this.offsetX > 0;
    BaseView.prototype.updateArrows.call (this);
};

DrumView.prototype.updateNoteMapping = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    this.noteMap = t != null && t.canHoldNotes && !this.surface.isSelectPressed () ? this.scales.getDrumMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
};

DrumView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_CLIP:
        case PUSH_BUTTON_SELECT:
        case PUSH_BUTTON_ADD_EFFECT:
        case PUSH_BUTTON_ADD_TRACK:
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_USER_MODE:
        case PUSH_BUTTON_DUPLICATE:
            return false;
    }
    return true;
};

DrumView.prototype.onSelect = function (event)
{
    this.updateNoteMapping ();
};

DrumView.prototype.onGridNote = function (note, velocity)
{
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);

    if (x < 4 && y < 4)
    {
        this.selectedPad = 4 * y + x;   // 0-16
        var playedPad = velocity == 0 ? -1 : this.selectedPad;
        
        // Mark selected note
        this.pressedKeys[this.offsetY + this.selectedPad] = velocity;

        // Delete all of the notes on that 'pad'
        if (playedPad >= 0 && this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            this.clip.clearRow (this.offsetY + this.selectedPad);
        }
        return;
    }
    
    if (y >= 4)
    {
        if (velocity != 0)
        {
            var col = 8 * (7 - y) + x;
            this.clip.toggleStep (col, this.offsetY + this.selectedPad, Config.accentActive ? Config.fixedAccentValue : velocity);
        }
    }
};

DrumView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decDrumOctave ();
    this.offsetY = DrumView.DRUM_START_KEY + this.scales.getDrumOctave () * 16;
    this.updateNoteMapping ();
};

DrumView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incDrumOctave ();
    this.offsetY = DrumView.DRUM_START_KEY + this.scales.getDrumOctave () * 16;
    this.updateNoteMapping ();
};

DrumView.prototype.drawGrid = function ()
{
    this.turnOffBlink ();
    var isRecording = this.model.getTransport ().isRecording || this.model.getCurrentTrackBank ().isClipRecording ();

    // 4x4 Grid
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 4; x++)
        {
            var index = 4 * y + x;
            var p = this.pads[index];
            var c = this.pressedKeys[this.offsetY + index] > 0 ? (isRecording ? PUSH_COLOR2_RED_HI : PUSH_COLOR2_GREEN_HI) : (this.selectedPad == index ? PUSH_COLOR2_BLUE_HI : (p.exists ? (p.mute ? PUSH_COLOR2_AMBER_LO : (p.solo ? PUSH_COLOR2_BLUE_LO : PUSH_COLOR2_YELLOW_HI)) : PUSH_COLOR_YELLOW_LO));
            this.surface.pads.lightEx (x, y, c);
        }
    }
    
    // Clip length/loop
    for (var x = 4; x < 8; x++)
        for (var y = 0; y < 4; y++)
            this.surface.pads.lightEx (x, y, PUSH_COLOR_BLACK);
            
    // Paint the sequencer steps
    var step = this.clip.getCurrentStep ();
    var hiStep = this.isInXRange (step) ? step % DrumView.NUM_DISPLAY_COLS : -1;
    for (var col = 0; col < DrumView.NUM_DISPLAY_COLS; col++)
    {
        var isSet = this.clip.getStep (col, this.offsetY + this.selectedPad);
        var hilite = col == hiStep;
        var x = col % 8;
        var y = 7 - Math.floor (col / 8);
        this.surface.pads.lightEx (x, y, isSet ? (hilite ? PUSH_COLOR2_GREEN_LO : PUSH_COLOR2_BLUE_HI) : hilite ? PUSH_COLOR2_GREEN_HI : PUSH_COLOR2_BLACK);
    }
};

DrumView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
}