import styles from './CliTerminal.module.css';

export function PromptEcho({ cwd, line }: { cwd: string; line: string }) {
  const path = cwd === '/' ? '' : cwd;
  return (
    <div className={styles.promptLine}>
      <span className={styles.prompt}>user@commit.fund</span>
      {path ? <span>{path}</span> : null}
      <span className={styles.promptSeparator}>&gt;</span>
      <span>{line}</span>
    </div>
  );
}
