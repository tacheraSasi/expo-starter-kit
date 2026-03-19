import { useState, useEffect } from "react";
import Api from "@/lib/api";

interface PostInteractionsState {
  isLiked: boolean;
  likeCount: number;
  playCount: number;
  isLiking: boolean;
  isLoading: boolean;
}

export function usePostInteractions(
  postId: number,
  initialLikeCount: number,
  initialPlayCount: number
) {
  const [state, setState] = useState<PostInteractionsState>({
    isLiked: false,
    likeCount: initialLikeCount,
    playCount: initialPlayCount,
    isLiking: false,
    isLoading: false,
  });

  const handleLike = async (): Promise<{
    success: boolean;
    newCount: number;
    isLiked: boolean;
  }> => {
    if (state.isLiking) {
      return {
        success: false,
        newCount: state.likeCount,
        isLiked: state.isLiked,
      };
    }

    setState((prev) => ({ ...prev, isLiking: true }));

    // Optimistic update
    const newIsLiked = !state.isLiked;
    const newLikeCount = newIsLiked ? state.likeCount + 1 : state.likeCount - 1;

    setState((prev) => ({
      ...prev,
      isLiked: newIsLiked,
      likeCount: newLikeCount,
    }));

    try {
      await Api.likePost(postId);
      setState((prev) => ({ ...prev, isLiking: false }));
      return { success: true, newCount: newLikeCount, isLiked: newIsLiked };
    } catch (error) {
      // Revert optimistic update on error
      setState((prev) => ({
        ...prev,
        isLiked: !newIsLiked,
        likeCount: state.likeCount,
        isLiking: false,
      }));
      return {
        success: false,
        newCount: state.likeCount,
        isLiked: !newIsLiked,
      };
    }
  };

  const recordPlay = async (
    duration: number
  ): Promise<{ success: boolean; newCount: number }> => {
    try {
      await Api.playPost(postId, { duration });
      const newPlayCount = state.playCount + 1;
      setState((prev) => ({ ...prev, playCount: newPlayCount }));
      return { success: true, newCount: newPlayCount };
    } catch (error) {
      return { success: false, newCount: state.playCount };
    }
  };

  return {
    ...state,
    handleLike,
    recordPlay,
    updateCounts: (likeCount: number, playCount: number) => {
      setState((prev) => ({ ...prev, likeCount, playCount }));
    },
  };
}
