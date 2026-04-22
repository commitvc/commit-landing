import type { TeamMember } from '@/lib/team';
import Image from 'next/image';
import styles from './Card.module.css';

export function ProfileCard({ member }: { member: TeamMember }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image src={member.avatar} alt={`${member.name}'s portrait`} width={120} height={120} />
      </div>
      <div className={styles.data}>
        <span className={styles.rule} />
        <p>
          <span className={styles.label}>
            {member.name}, {member.role}
          </span>
        </p>
        <p>
          <span className={styles.label}>{member.location}</span>
        </p>
        <p>
          <a href={member.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {member.github}
          </a>
        </p>
        {member.linkedin ? (
          <p>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {member.linkedin}
            </a>
          </p>
        ) : null}
        <span className={styles.rule} />
      </div>
    </div>
  );
}
