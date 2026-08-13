import { useGitHubRepo } from './useGitHubRepo';
import { decodeBase64Utf8 } from '@/lib/github';

type ReadmeData = {
  content: string; // markdown 文本
  htmlUrl: string;
};

/**
 * 拉取仓库 README：GitHub API 返回 base64，需解码
 */
export function useReadme(repo: string) {
  return useGitHubRepo<ReadmeData>(
    repo,
    '/readme',
    (raw) => ({
      content: decodeBase64Utf8(raw.content ?? ''),
      htmlUrl: raw.html_url ?? '',
    }),
  );
}
