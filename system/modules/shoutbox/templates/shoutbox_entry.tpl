<?php foreach($this->msgs as $m): ?>
<div class="entry">
    <!--
    field values go here
    -->
    <span class="user">
        [<?php echo $m['username']; ?>
    </span>
    <span class="time">
        <?php echo $m['time']; ?>]
    </span>
    <span class="text">
        <?php echo $m['text']; ?>
    </span>
</div>
<?php endforeach; ?>
