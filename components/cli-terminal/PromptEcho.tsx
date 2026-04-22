import styles from './CliTerminal.module.css';

export function PromptEcho({ cwd, line }: { cwd: string; line: string }) {
  const promptText = cwd === '/' ? 'user@commit.fund' : `user@commit.fund:${cwd}`;
  return (
    <div className={styles.promptLine}>
      <span className={styles.prompt}>{promptText}</span>
      <span className={styles.promptSeparator}>&gt;</span>
      <span>{line}</span>
    </div>
  );
}
