<?php
/**
 * TYPOlight webCMS
 * Copyright (C) 2005 Leo Feyer
 *
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation, either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program. If not, please visit the Free
 * Software Foundation website at http://www.gnu.org/licenses/.
 *
 * PHP version 5
 * @copyright  Ueli Kunz 2010
 * @author     Ueli Kunz <elun@gmx.ch>
 * @package    ia.contao.system.modules.shoutbox
 * @license    LGPL
 */


/**
 * Class shoutbox
 *
 * Provide methods to handle post requests.
 * @copyright  Ueli Kunz 2010
 * @author     Ueli Kunz <elun@gmx.ch>
 */

require('../../initialize.php');

class shoutbox extends ext_backend_module{

	protected $tableName = 'tl_shoutbox';
	protected $strTemplate = 'shoutbox_container';
	protected $strEntryTemplate = 'shoutbox_entry';
	protected $entryTemplate;
	protected $maxId;
	protected $validationErrors = array();
	
	public function __construct(){
		parent::__construct();
		// login with auth token provided by get parameter BE_USER_AUTH
		$this->User->authenticate();
	}

	public function compile(){
		$reply = "";
		$params = json_decode($this->Input->post('data'), true);

		switch($params['act']){
			case 'load':
				$reply = $this->getMessagesRendered($params['minId']);
				// load messages newer than the one identified by the request param
				break;
			case 'post':
				$reply = $this->saveMessage($params);
				// save posted data as new message entry in db
				break;
			case 'init':
			default:
				$params['act'] = 'init';
				// get master template
				// load existing messages
				// directly send rendered master template to client
				$reply = $this->getContainerRendered();
				break;
		}

		// send to client
		echo json_encode(array(
		'status'	=>'ok',
		'act' 		=> $params['act'], 
		'maxId' 	=> isset($this->maxId) ? $this->maxId : $params['minId'],
		'content' 	=> $reply));
	}


	protected function getContainerRendered(){
		$this->Template = new BackendTemplate($this->strTemplate);
		$this->Template->messageHistory = $this->getMessagesRendered(-1);
		// return master template with message history markup embedded
		return $this->Template->parse();
	}


	protected function getMessagesRendered($minId){
		if(!isset($minId) || empty($minId)){
			$minId = -1;
		}
		$this->entryTemplate = new BackendTemplate($this->strEntryTemplate);
		$this->entryTemplate->msgs = $this->mapDBMessages($this->getDBMessages($minId));

		// return rendered item template
		return $this->entryTemplate->parse();
	}


	private function saveMessage($params){
		$this->validate($params);

		if($this->canSave === true){
			$set = array(
				'text'		=> $params['text'], 
				'tstamp'	=> time(), 
				'username'	=> $this->getUsername());

			$this->Database->prepare("INSERT INTO {$this->tableName} %s")->set($set)->execute();

			return "";
		}else{
			echo json_encode(array('status'=> 'error', 'content'=> implode(' ', $this->validationErrors)));
		}
	}


	private function validate($params){

	}


	private function getDBMessages($minId){

		$dbMessages = $this->Database->prepare("SELECT * FROM {$this->tableName} WHERE id > ? ORDER BY tstamp DESC")->limit(100)->execute($minId);
		$messages = array();

		if($dbMessages->numRows){
			$messages = $dbMessages->fetchAllAssoc();
			$this->maxId = $messages[0]['id'];
		}else{
			// return empty array
		}
		return $messages;
	}


	private function mapDBMessages($dbMessages){
		$msgs = array();
		foreach($dbMessages as $msg){
				
			$dFormat = "H:i";
			// datum ist von gestern
			if(strtotime('midnight') > $msg['tstamp']){
				$dFormat = "D H:i";
			}
			$time = date($dFormat, $msg['tstamp']);
				
			//$regex = "@([A-Za-z]+://)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_%&\?\/.=,#+]+)@"; // erkennt auch abc...a
			$regex = "°(((https?|file|ftp)://)([\w@][\w.:@]+)\/?[\w\.?=%&=\-@/$,#+\\\]*)°"; 	   // braucht protokoll
			$text = html_entity_decode($msg['text']);
			$matchCount = preg_match_all($regex, $text, $matches);
			if($matchCount > 0){
				//$protocoll = trim($matches[1][0]) == '' ? 'http://' : '';
				$text = preg_replace($regex, '<a href="$1" target="_blank">-LINK-</a>', $text);
			}
				
			$msgs[] = array(
				'id'		=> $msg['id'],
				'username' 	=> $msg['username'],
				'text' 		=> $text,
				'time'		=> $time
			);
		}
		return $msgs;
	}


	private function getUsername(){
		if($this->User->username){
			return $this->User->username;
		}
		return '';
	}
}

try{
	$sb = new Shoutbox();
	$sb->compile();
}catch(Exception $e){
	echo json_encode(array(
	'status'	=> 'error', 
	'content'	=> $e->getMessage()));
}
