// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractView.prototype.stopPressed = false;
AbstractView.prototype.automationPressed = false;

// TODO can this be integrated into the event system so all long presses
// record the mode at the start of the touch down event
AbstractView.prototype.longPressPreviousMode = null;

AbstractView.prototype.onPitchbend = function (data1, data2) {};

//--------------------------------------
// Group 1
//--------------------------------------

AbstractView.prototype.onPlay = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleLoop ();
    else
    {
        if (!this.restartFlag)
        {
            this.model.getTransport ().play ();
            this.doubleClickTest ();
        }
        else
        {
            this.model.getTransport ().stopAndRewind ();
            this.restartFlag = false;
        }
    }
};

AbstractView.prototype.onRecord = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleLauncherOverdub ();
    else
        this.model.getTransport ().record ();
};

AbstractView.prototype.onNew = function (event)
{
    if (!event.isDown ())
        return;
    var tb = this.model.getCurrentTrackBank ();
    var t = tb.getSelectedTrack ();
    if (t != null)
    {
        var slotIndexes = tb.getSelectedSlots (t.index);
        var slotIndex = slotIndexes.length == 0 ? 0 : slotIndexes[0].index;
        for (var i = 0; i < 8; i++)
        {
            var sIndex = (slotIndex + i) % 8;
            var s = t.slots[sIndex];
            if (!s.hasContent)
            {
                var slots = tb.getClipLauncherSlots (t.index);
                slots.createEmptyClip (sIndex, Math.pow (2, tb.getNewClipLength ()));
                if (slotIndex != sIndex)
                    slots.select (sIndex);
                slots.launch (sIndex);
                this.model.getTransport ().setLauncherOverdub (true);
                return;
            }
        }
    }
    displayNotification ("In the current selected grid view there is no empty slot. Please scroll down.");
};

AbstractView.prototype.onDuplicate = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().doubleClip ();
};

AbstractView.prototype.onAutomation = function (event)
{
    if (!event.isDown ())
        return;

    if (this.surface.isSelectPressed ())
        this.model.getTransport ().resetAutomationOverrides ();
    else if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleWriteClipLauncherAutomation ();
    else
    {
        var selectedTrack = this.model.getCurrentTrackBank ().getSelectedTrack ();
        if (selectedTrack != null)
            this.model.getTransport ().toggleWriteArrangerAutomation ();
    }
};

AbstractView.prototype.onFixedLength = function (event)
{
    if (event.isDown ())
        this.surface.setPendingMode (this.surface.getCurrentMode () == MODE_FIXED ? this.surface.getPreviousMode () : MODE_FIXED);
};

//--------------------------------------
// Group 2
//--------------------------------------

AbstractView.prototype.onQuantize = function (event)
{
    if (!event.isDown ())
        return;

    if (this.surface.isShiftPressed ())
        this.surface.setPendingMode (MODE_GROOVE);
    else
        this.model.getApplication ().quantize ();
};

AbstractView.prototype.onDouble = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().duplicate ();
};

AbstractView.prototype.onDelete = function (event)
{
    if (event.isUp ())
        this.model.getApplication ().deleteSelection ();
};

AbstractView.prototype.onUndo = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().redo ();
    else
        this.model.getApplication ().undo ();
};

//--------------------------------------
// Group 3
//--------------------------------------

AbstractView.prototype.onSmallKnob1 = function (increase)
{
    this.model.getTransport ().changeTempo (increase, this.surface.isShiftPressed ());
};

AbstractView.prototype.onSmallKnob1Touch = function (isTouched)
{
    this.model.getTransport ().setTempoIndication (isTouched);
};

// Change time (play position)
AbstractView.prototype.onSmallKnob2 = function (increase)
{
    this.model.getTransport ().changePosition (increase, this.surface.isShiftPressed ());
};

AbstractView.prototype.onSmallKnob2Touch = function (isTouched) {};

//--------------------------------------
// Group 4
//--------------------------------------

AbstractView.prototype.onMetronome = function (event)
{
    if (event.isDown ())
    {
        if (this.surface.isShiftPressed ())
            this.model.getTransport ().toggleMetronomeTicks ();
        else
            this.model.getTransport ().toggleClick ();
    }
};

AbstractView.prototype.onTapTempo = function (event)
{
    if (event.isDown ())
        this.model.getTransport ().tapTempo ();
};

//--------------------------------------
// Group 5
//--------------------------------------

AbstractView.prototype.onValueKnobTouch = function (knob, isTouched)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onValueKnobTouch (knob, isTouched);
};

AbstractView.prototype.onValueKnob9 = function (value)
{
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().changeMetronomeVolume (value, Config.fractionValue);
    else
        this.model.getMasterTrack ().changeVolume (value, this.surface.getFractionValue ());
};

AbstractView.prototype.onValueKnob9Touch = function (isTouched)
{
    if (this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getMasterTrack ().resetVolume ();
        return;
    }

    var isMasterMode = this.surface.getCurrentMode () == MODE_MASTER;
    if (isTouched && isMasterMode)
        return;

    if (isTouched)
        this.surface.setPendingMode (MODE_MASTER_TEMP);
    else if (!isMasterMode)
        this.surface.setPendingMode (this.surface.getPreviousMode ());
};

AbstractView.prototype.onFirstRow = function (index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onFirstRow (index);
};

AbstractView.prototype.onSecondRow = function (index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onSecondRow (index);
};

//--------------------------------------
// Group 6
//--------------------------------------

AbstractView.prototype.onMaster = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.UP:
            var restoredMode = this.longPressPreviousMode != null ?
                this.longPressPreviousMode : this.surface.getPreviousMode ();

            if (this.surface.getCurrentMode () == MODE_FRAME)
                this.surface.setPendingMode (restoredMode);

            this.longPressPreviousMode = null;
            break;

        case ButtonEvent.DOWN:
            this.surface.setPendingMode (MODE_MASTER);
            this.model.getMasterTrack ().select ();
            break;

        case ButtonEvent.LONG:
            this.longPressPreviousMode = this.surface.getPreviousMode ();
            this.surface.setPendingMode (MODE_FRAME);
            break;
    }
};

AbstractView.prototype.onStop = function (event)
{
    if (this.surface.isShiftPressed ())
    {
        this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
        return;
    }
    this.stopPressed = event.isDown ();
    this.surface.setButton (PUSH_BUTTON_STOP, this.stopPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

AbstractView.prototype.onScene = function (index) {};

//--------------------------------------
// Group 7
//--------------------------------------

AbstractView.prototype.onVolume = function (event)
{
    if (!event.isDown ())
        return;
    
    if (this.surface.getCurrentMode () == MODE_VOLUME)
        this.surface.setPendingMode (MODE_CROSSFADER);
    else
        this.surface.setPendingMode (MODE_VOLUME);
};

AbstractView.prototype.onPanAndSend = function (event)
{
    if (!event.isDown ())
        return;
     
    var mode = -1;
    var fxTrackBank = this.model.getEffectTrackBank ();
    if (this.model.getCurrentTrackBank () === fxTrackBank)
    {
        // No Sends on FX tracks
        mode = MODE_PAN;
    }
    else
    {
        mode = this.surface.getCurrentMode () + 1;
        // Wrap
        if (mode < MODE_PAN || mode > MODE_SEND6)
            mode = MODE_PAN;
        // Check if Send channel exists
        if (mode >= MODE_SEND1 && mode <= MODE_SEND6 && (fxTrackBank != null && !fxTrackBank.getTrack (mode - MODE_SEND1).exists))
            mode = MODE_PAN;
    }
    this.surface.setPendingMode (mode);
};

AbstractView.prototype.onTrack = function (event)
{
    if (!event.isDown ())
        return;
        
    if (this.surface.isShiftPressed ())
    {
        this.surface.toggleVU ();
        return;
    }
        
    if (this.surface.isActiveMode (MODE_TRACK))
        this.model.toggleCurrentTrackBank ();
    else
        this.surface.setPendingMode (MODE_TRACK);
};

AbstractView.prototype.onClip = function (event)
{
    if (event.isDown ())
        this.surface.setPendingMode (MODE_CLIP);
};

AbstractView.prototype.onDevice = function (event)
{
    if (!event.isDown ())
        return;
    var selectMode = this.surface.getMode (MODE_PARAM_PAGE_SELECT);
    var cm = this.surface.getCurrentMode ();
    if (cm == MODE_PARAM_PAGE_SELECT || !selectMode.isPageMode (cm))
        this.surface.setPendingMode (selectMode.getCurrentMode ());
    else
        this.surface.setPendingMode (MODE_PARAM_PAGE_SELECT);
};

AbstractView.prototype.onBrowse = function (event)
{
    if (!event.isDown ())
        return;

    var mode = this.surface.getCurrentMode ();
    if (mode == MODE_BANK_DEVICE || mode == MODE_PRESET)
        this.surface.setPendingMode (MODE_PRESET);
    else
    {
        if (this.surface.isShiftPressed ())
            this.model.getApplication ().toggleInspector ();
        else
            this.model.getApplication ().toggleBrowserVisibility ();
    }
};

//--------------------------------------
// Group 8
//--------------------------------------

AbstractView.prototype.onDeviceLeft = function (event)
{
    if (!event.isDown ())
        return;

    // TODO FIX The returned channel selection does not contain the layers instead it is the top level tracks selection
    var cd = this.model.getCursorDevice ();
    if (cd.hasSelectedDevice ())
    {
        if (cd.hasLayers ())
            this.surface.setPendingMode (this.surface.getCurrentMode () == MODE_BANK_DEVICE ? MODE_DEVICE_LAYER : MODE_BANK_DEVICE);
    }
    else
    {
        //this.model.getCursorDevice ().cursorDevice.selectFirstInLayer (0);
    }
};

AbstractView.prototype.onDeviceRight = function (event)
{
    if (event.isDown ())   // TODO Create function in CursorDeviceProxy when API is fully working and tested
        this.model.getCursorDevice ().cursorDevice.selectParent ();
};

AbstractView.prototype.onMute = function (event)
{
    this.model.getCurrentTrackBank ().setTrackState (TrackState.MUTE);
};

AbstractView.prototype.onSolo = function (event)
{
    this.model.getCurrentTrackBank ().setTrackState (TrackState.SOLO);
};

AbstractView.prototype.onScales = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.DOWN:
            this.quitScalesMode = false;
            this.surface.setPendingMode (this.surface.getCurrentMode () == MODE_SCALES ? this.surface.getPreviousMode () : MODE_SCALES);
            break;
        case ButtonEvent.LONG:
            this.quitScalesMode = true;
            break;
        case ButtonEvent.UP:
            if (this.quitScalesMode)
                this.surface.setPendingMode (this.surface.getPreviousMode ());
            break;
    }
};

AbstractView.prototype.onUser = function (event) {};

AbstractView.prototype.onRepeat = function (event) {};

AbstractView.prototype.onAccent = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.DOWN:
            this.quitAccentMode = false;
            break;
        case ButtonEvent.LONG:
            this.quitAccentMode = true;
            this.surface.setPendingMode (MODE_ACCENT);
            break;
        case ButtonEvent.UP:
            if (this.quitAccentMode)
                this.surface.setPendingMode (this.surface.getPreviousMode ());
            else
                Config.setAccentEnabled (!Config.accentActive);
            break;
    }
};

AbstractView.prototype.onOctaveDown = function (event) {};
AbstractView.prototype.onOctaveUp = function (event) {};

//--------------------------------------
// Group 9
//--------------------------------------

AbstractView.prototype.onAddEffect = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().addEffect ();
};

AbstractView.prototype.onAddTrack = function (event)
{
    if (!event.isDown ())
        return;
    
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().addEffectTrack ();
    else if (this.surface.isSelectPressed ())
        this.model.getApplication ().addAudioTrack ();
    else
        this.model.getApplication ().addInstrumentTrack ();
};

AbstractView.prototype.onNote = function (event)
{
    if (!event.isDown ())
        return;
        
    if (this.surface.isActiveView (VIEW_SESSION))
    {
        var tb = this.model.getCurrentTrackBank ();
        var sel = tb.getSelectedTrack ();
        var viewID = VIEW_PLAY;
        if (sel != null)
        {
            viewID = tb.getPreferredView (sel.index);
            if (viewID == null)
                viewID = VIEW_PLAY;
        }
        this.surface.setActiveView (viewID);
        return;
    }
    
    this.surface.setPendingMode (MODE_VIEW_SELECT);
};

AbstractView.prototype.onSession = function (event)
{
    if (event.isDown ())
        this.surface.setActiveView (VIEW_SESSION);
};

AbstractView.prototype.onSelect = function (event) {};

AbstractView.prototype.onShift = function (event)
{
    this.surface.setButton (PUSH_BUTTON_SHIFT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
    
    var cm = this.surface.getCurrentMode ();
    if (event.isDown () && cm == MODE_SCALES)
        this.surface.setPendingMode (MODE_SCALE_LAYOUT);
    else if (event.isUp () && cm == MODE_SCALE_LAYOUT)
        this.surface.setPendingMode (MODE_SCALES);
};

AbstractView.prototype.scrollLeft = function (event)
{
    switch (this.surface.getCurrentMode ())
    {
        case MODE_BANK_DEVICE:
        case MODE_PRESET:
            this.model.getCursorDevice ().selectPrevious ();
            break;
    
        default:
            var tb = this.model.getCurrentTrackBank ();
            var sel = tb.getSelectedTrack ();
            var index = sel == null ? 0 : sel.index - 1;
            if (index == -1 || this.surface.isShiftPressed ())
            {
                if (!tb.canScrollTracksUp ())
                    return;
                tb.scrollTracksPageUp ();
                var newSel = index == -1 || sel == null ? 7 : sel.index;
                scheduleTask (doObject (this, this.selectTrack), [ newSel ], 75);
                return;
            }
            this.selectTrack (index);
            break;
    }
};

AbstractView.prototype.scrollRight = function (event)
{
    switch (this.surface.getCurrentMode ())
    {
        case MODE_BANK_DEVICE:
        case MODE_PRESET:
            this.model.getCursorDevice ().selectNext ();
            break;
            
        default:
            var tb = this.model.getCurrentTrackBank ();
            var sel = tb.getSelectedTrack ();
            var index = sel == null ? 0 : sel.index + 1;
            if (index == 8 || this.surface.isShiftPressed ())
            {
                if (!tb.canScrollTracksDown ())
                    return;
                tb.scrollTracksPageDown ();
                var newSel = index == 8 || sel == null ? 0 : sel.index;
                scheduleTask (doObject (this, this.selectTrack), [ newSel ], 75);
                return;
            }
            this.selectTrack (index);
            break;
    }
};

//--------------------------------------
// Group 11
//--------------------------------------

AbstractView.prototype.onFootswitch1 = function (value) {};

AbstractView.prototype.onFootswitch2 = function (value)
{
    this.onNew (new ButtonEvent (value == 127 ? ButtonEvent.DOWN : ButtonEvent.UP));
};


//--------------------------------------
// Protected API
//--------------------------------------

AbstractView.prototype.updateButtons = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var isMuteState = tb.isMuteState ();
    this.surface.setButton (PUSH_BUTTON_MUTE, isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_SOLO, !isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

AbstractView.prototype.updateArrowStates = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var isDevice = this.surface.getCurrentMode () == MODE_BANK_DEVICE || this.surface.getCurrentMode () == MODE_PRESET;
    var sel = tb.getSelectedTrack ();
    // var cd = this.model.getCursorDevice ();
    this.canScrollLeft = isDevice ? true /* TODO: Bitwig bug cd.canSelectPreviousFX () */ : sel != null && sel.index > 0 || tb.canScrollTracksUp ();
    this.canScrollRight = isDevice ? true /* TODO: Bitwig bug cd.canSelectNextFX () */ : sel != null && sel.index < 7 || tb.canScrollTracksDown ();
};

AbstractView.prototype.updateArrows = function ()
{
    this.updateArrowStates ();
    this.surface.setButton (PUSH_BUTTON_LEFT, this.canScrollLeft ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.setButton (PUSH_BUTTON_RIGHT, this.canScrollRight ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.setButton (PUSH_BUTTON_UP, this.canScrollUp ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.setButton (PUSH_BUTTON_DOWN, this.canScrollDown ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
};

AbstractView.prototype.updateRibbonMode = function ()
{
    this.surface.setRibbonMode (PUSH_RIBBON_VOLUME);
    this.surface.output.sendPitchbend (0, 0);
};

AbstractView.prototype.canSelectedTrackHoldNotes = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    return t != null && t.canHoldNotes;
};
