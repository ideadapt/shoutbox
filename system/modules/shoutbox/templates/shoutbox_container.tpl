<div class="shoutbox_outer sb_inactive">
    <div id="show_hide_button">
        <a href="#" onClick="javascript:return false;" title="expand / collapse shoutbox">X</a>
    </div>
    <div id="inner">
        <!--
        message history
        -->
        <div id="msg_history">
            <?php echo $this->messageHistory; ?>
        </div>
        <div id="notification">
            
        </div>
        <!--
        post message form
        -->
        
        <form action="<?php echo $this->request; ?>" id="tl_shoutbox" class="tl_form" method="post">
            <input type="hidden" name="FORM_SUBMIT" value="tl_shoutbox"/>
			<input type="hidden" name="REQUEST_TOKEN" value="<?php echo REQUEST_TOKEN; ?>">
            <input id="txt_text" type="text" maxlength="220"/>
            <input type="submit" value="" id="btn_save" name="btn_save"/>
        </form>
    </div>
</div>