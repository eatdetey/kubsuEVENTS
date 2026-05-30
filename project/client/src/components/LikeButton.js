import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { Context } from '..';
import {
  likeNewsPost,
  unlikeNewsPost,
  fetchLikesCount,
} from '../http/likesAPI';

// Reusable like control with optimistic updates and rollback on failure.
// Pass `initialCount` / `initialLiked` if the parent already has them to avoid
// the extra fetch; otherwise the component loads them itself.
const LikeButton = observer(({ newsPostId, initialCount, initialLiked, size }) => {
  const { user } = useContext(Context);
  const [count, setCount] = useState(initialCount ?? null);
  const [liked, setLiked] = useState(Boolean(initialLiked));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialCount !== undefined && initialLiked !== undefined) return;
    let alive = true;
    fetchLikesCount(newsPostId)
      .then(({ likesCount, liked: serverLiked }) => {
        if (!alive) return;
        setCount(likesCount);
        setLiked(Boolean(serverLiked));
      })
      .catch(() => {
        if (!alive) return;
        setCount((c) => c ?? 0);
      });
    return () => { alive = false; };
  }, [newsPostId, initialCount, initialLiked]);

  const handleClick = async (e) => {
    // Card-level click handlers (navigate to detail) must not fire.
    e.stopPropagation();
    e.preventDefault();

    if (!user.isAuth) {
      toast.info('Войдите, чтобы поставить лайк');
      return;
    }
    if (pending) return;

    const prevLiked = liked;
    const prevCount = count ?? 0;
    const nextLiked = !prevLiked;

    // Optimistic update.
    setLiked(nextLiked);
    setCount(prevCount + (nextLiked ? 1 : -1));
    setPending(true);

    try {
      const res = nextLiked
        ? await likeNewsPost(newsPostId)
        : await unlikeNewsPost(newsPostId);
      // Sync with server-confirmed count in case other clients changed it.
      if (typeof res?.likesCount === 'number') {
        setCount(res.likesCount);
      }
    } catch (err) {
      // Rollback.
      setLiked(prevLiked);
      setCount(prevCount);
      toast.error(err.response?.data?.message || 'Не удалось обновить лайк');
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`like-btn ${liked ? 'is-active' : ''} ${size === 'lg' ? 'like-btn--lg' : ''}`}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
    >
      <span className="like-icon" aria-hidden="true">{liked ? '♥' : '♡'}</span>
      <span>{count ?? 0}</span>
    </button>
  );
});

export default LikeButton;
