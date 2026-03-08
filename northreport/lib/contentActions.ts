import { getDb, generateId, FieldValue } from '@/lib/firebase';
import { computeFeedScore } from '@/lib/feedScore';

type Collection = 'posts' | 'stories';

export async function voteOnContent(collection: Collection, id: string, userId: string) {
  const db = getDb();
  const voteId = `${id}_${userId}`;

  const existingVote = await db.collection('content_votes').doc(voteId).get();
  if (existingVote.exists) {
    return Response.json({ error: 'Already voted' }, { status: 409 });
  }

  await db.collection('content_votes').doc(voteId).set({
    contentId: id,
    collection,
    userId,
    value: 1,
    createdAt: new Date(),
  });

  const contentRef = db.collection(collection).doc(id);
  const contentDoc = await contentRef.get();

  if (!contentDoc.exists) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const contentData = contentDoc.data()!;
  const newUpvotes = (contentData.upvotes || 0) + 1;

  await contentRef.update({
    upvotes: FieldValue.increment(1),
    updatedAt: new Date(),
  });

  const updated = { ...contentData, upvotes: newUpvotes };
  const newScore = computeFeedScore(updated as any);
  await contentRef.update({ feedScore: newScore });

  return Response.json({ upvotes: newUpvotes });
}

export async function commentOnContent(collection: Collection, id: string, userId: string, text: string) {
  if (!text || text.length < 1 || text.length > 300) {
    return Response.json({ error: 'Comment must be 1-300 chars' }, { status: 400 });
  }

  const db = getDb();
  const commentId = generateId('content_comments');

  const comment = {
    contentId: id,
    collection,
    userId,
    text,
    createdAt: new Date(),
  };

  await db.collection('content_comments').doc(commentId).set(comment);

  const contentRef = db.collection(collection).doc(id);
  const contentDoc = await contentRef.get();

  if (contentDoc.exists) {
    const contentData = contentDoc.data()!;
    await contentRef.update({
      commentCount: FieldValue.increment(1),
      updatedAt: new Date(),
    });

    const updated = { ...contentData, commentCount: (contentData.commentCount || 0) + 1 };
    const newScore = computeFeedScore(updated as any);
    await contentRef.update({ feedScore: newScore });
  }

  return Response.json(
    { id: commentId, text: comment.text, createdAt: comment.createdAt.toISOString() },
    { status: 201 }
  );
}

export async function getComments(collection: Collection, id: string) {
  const db = getDb();
  const snapshot = await db
    .collection('content_comments')
    .where('contentId', '==', id)
    .where('collection', '==', collection)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const comments = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
  }));

  return Response.json({ comments });
}

export async function flagContent(collection: Collection, id: string, userId: string) {
  const db = getDb();
  const contentRef = db.collection(collection).doc(id);
  const contentDoc = await contentRef.get();

  if (!contentDoc.exists) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const content = contentDoc.data()!;

  if (content.flaggedBy?.includes(userId)) {
    return Response.json({ error: 'Already flagged' }, { status: 409 });
  }

  const newFlagCount = (content.flagCount || 0) + 1;

  await contentRef.update({
    flagCount: FieldValue.increment(1),
    flaggedBy: FieldValue.arrayUnion(userId),
    updatedAt: new Date(),
  });

  if (newFlagCount >= 3) {
    await contentRef.update({ hidden: true });
  }

  return Response.json({ flagCount: newFlagCount });
}

export async function repostContent(collection: Collection, id: string, userId: string) {
  const db = getDb();
  const repostId = `${id}_${userId}`;

  const existingRepost = await db.collection('content_reposts').doc(repostId).get();
  if (existingRepost.exists) {
    return Response.json({ error: 'Already reposted' }, { status: 409 });
  }

  await db.collection('content_reposts').doc(repostId).set({
    contentId: id,
    collection,
    userId,
    createdAt: new Date(),
  });

  const contentRef = db.collection(collection).doc(id);
  const contentDoc = await contentRef.get();

  if (!contentDoc.exists) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const contentData = contentDoc.data()!;
  const newRepostCount = (contentData.repostCount || 0) + 1;

  await contentRef.update({
    repostCount: FieldValue.increment(1),
    updatedAt: new Date(),
  });

  const updated = { ...contentData, repostCount: newRepostCount };
  const newScore = computeFeedScore(updated as any);
  await contentRef.update({ feedScore: newScore });

  return Response.json({ repostCount: newRepostCount });
}
