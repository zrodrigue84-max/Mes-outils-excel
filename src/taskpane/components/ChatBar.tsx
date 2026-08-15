import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Input,
  Button,
  Text,
  Caption1,
} from '@fluentui/react-components';
import { SendRegular, ChatRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    flexShrink: 0,
    borderTop: `2px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '12px 18px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: '118px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
});

interface ChatBarProps {
  onSend?: (message: string) => void;
}

const ChatBar: React.FC<ChatBarProps> = ({ onSend }) => {
  const styles = useStyles();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className={styles.root} aria-label="Barre de chat IA">
      <div className={styles.header}>
        <ChatRegular fontSize={16} aria-hidden />
        <Text className={styles.headerTitle}>Assistant IA</Text>
      </div>

      <div className={styles.inputRow}>
        <Input
          className={styles.input}
          placeholder="Décrivez ce que vous voulez faire…"
          value={message}
          onChange={(_, data) => setMessage(data.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message pour l'assistant IA"
        />
        <Button
          appearance="primary"
          icon={<SendRegular />}
          onClick={handleSend}
          disabled={!message.trim()}
          aria-label="Envoyer le message"
        />
      </div>

      <Caption1 className={styles.hint}>
        Exemple : « Fusionne les fichiers ventes et clients sur la colonne ID »
      </Caption1>
    </section>
  );
};

export default ChatBar;
