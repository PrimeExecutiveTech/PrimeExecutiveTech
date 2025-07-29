import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { supabase } from '../supabaseClient';

export default function VoiceCall({ user, targetId, targetName = 'Unknown', onEnd }) {
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | incoming | incall
  const [incoming, setIncoming] = useState(null);

  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(new Audio());

  const getMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return stream;
    } catch (err) {
      alert('Microphone access is required for calling.');
      throw err;
    }
  };

  const sendSignal = async (to, type, payload) => {
    await supabase.from('signals').insert({ from: user.id, to, type, payload });
  };

  const createPeer = async (initiator, remoteSignal, remoteId) => {
    const stream = await getMic();
    const peer = new Peer({ initiator, trickle: false, stream });
    peerRef.current = peer;

    peer.on('signal', async (data) => {
      await sendSignal(remoteId, initiator ? 'offer' : 'answer', data);
    });

    if (remoteSignal) peer.signal(remoteSignal);

    peer.on('connect', () => {
      setCallStatus('incall');
    });

    peer.on('stream', (remoteStream) => {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(console.error);
    });

    peer.on('close', endCall);
    peer.on('error', (err) => {
      console.error('Peer error:', err);
      endCall();
    });
  };

  const startCall = async () => {
    setCallStatus('calling');
    await createPeer(true, null, targetId);
  };

  const acceptCall = async () => {
    if (!incoming) return;
    setCallStatus('incall');
    await createPeer(false, incoming.signal, incoming.from);
    setIncoming(null);
  };

  const declineCall = () => {
    setIncoming(null);
    setCallStatus('idle');
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    peerRef.current = null;
    streamRef.current = null;
    setCallStatus('idle');
    if (onEnd) onEnd();
  };

  useEffect(() => {
    const channel = supabase
      .channel(`voice-call-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'signals',
        filter: `to=eq.${user.id}`,
      }, (payload) => {
        const { from, type, payload: signalData } = payload.new;
        if (type === 'offer') {
          setIncoming({ from, signal: signalData });
          setCallStatus('incoming');
        } else if (type === 'answer' && peerRef.current) {
          peerRef.current.signal(signalData);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user.id]);

  return (
    <div className="voice-call-box">
      {callStatus === 'incall' && (
        <>
          <p>🔊 In Call with <strong>{targetName}</strong></p>
          <button onClick={endCall}>End Call</button>
        </>
      )}

      {callStatus === 'calling' && <p>📞 Calling <strong>{targetName}</strong>...</p>}

      {callStatus === 'incoming' && incoming && (
        <>
          <p>📥 Incoming Call from <strong>{incoming.from}</strong></p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={declineCall}>Decline</button>
        </>
      )}

      {callStatus === 'idle' && (
        <button onClick={startCall}>Call {targetName}</button>
      )}
    </div>
  );
}