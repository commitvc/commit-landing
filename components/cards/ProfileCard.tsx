'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';
import type { TeamMember } from '@/lib/team';
import styles from './ProfileCard.module.css';

export function ProfileCard({ member }: { member: TeamMember }) {
  const textRef = useRef<HTMLDivElement>(null);
  const [avatarSize, setAvatarSize] = useState(120);

  useLayoutEffect(() => {
    if (textRef.current) setAvatarSize(textRef.current.offsetHeight);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.avatar} style={{ width: avatarSize, height: avatarSize }}>
          <Image
            src={member.avatar}
            alt={`${member.name}'s portrait`}
            width={avatarSize}
            height={avatarSize}
          />
        </div>
        <div ref={textRef} className={styles.headerText}>
          <div>
            <div className={styles.name}>{member.name}</div>
            <div className={styles.tagline}>{member.tagline ?? member.role}</div>
          </div>
          <div className={styles.links}>
            <a href={member.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {member.linkedin ? (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            ) : null}
            {member.twitter ? (
              <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                X
              </a>
            ) : null}
            {member.website ? (
              <a href={member.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {member.focus || member.languages ? (
        <div className={styles.kv}>
          {member.focus ? (
            <>
              <div className={styles.kvLabel}>focus</div>
              <div className={styles.kvValue}>{member.focus}</div>
            </>
          ) : null}
          {member.languages ? (
            <>
              <div className={styles.kvLabel}>languages</div>
              <div className={styles.kvValue}>{member.languages}</div>
            </>
          ) : null}
        </div>
      ) : null}

      {member.description ? (
        <section className={styles.about}>
          <div className={styles.sectionTitle}># about</div>
          <p className={styles.description}>{member.description}</p>
        </section>
      ) : null}
    </div>
  );
}
