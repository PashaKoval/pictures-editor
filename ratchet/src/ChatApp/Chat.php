<?php

namespace ChatApp;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use React\EventLoop\StreamSelectLoop;
use Predis\Async\Client;

class Chat implements MessageComponentInterface
{
    private $wsclients = null;

    public function __construct()
    {
        $this->wsclients = new \SplObjectStorage();
        
        echo "Ratchet Chat server running\n";
    }
    
    public function init($redis)
    {
      echo "Connected to Redis, now listening for incoming messages...\n";
    
      $redis->pubSubLoop('chat', function ($event) {
        echo "Received message `{$event->payload}` from {$event->channel}.\n";
    
        foreach ($this->wsclients as $wsclient) {
          $wsclient->send($event->payload);
        }
      });
      
    }

    public function onOpen(ConnectionInterface $conn)
    {
        // Store the new connection to send messages to later
        $this->wsclients->attach($conn);

        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $numRecv = count($this->wsclients) - 1;
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

        foreach ($this->wsclients as $client) {
            if ($from !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->wsclients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        trigger_error("An error has occurred: {$e->getMessage()}\n", E_USER_WARNING);
        $conn->close();
    }
}
