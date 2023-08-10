import { PipelineStage } from 'mongoose';

export const getPaginatedResultAggregation = (
  page: number = 1,
  pageSize: number,
): PipelineStage[] => {
  const currentPage = typeof page === 'string' ? parseInt(page) : page;

  const skip = (currentPage - 1) * pageSize;
  const limit = pageSize;
  return [
    {
      $facet: {
        paginatedResults: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
    {
      $project: {
        paginatedResults: 1,
        totalCount: {
          $ifNull: [
            {
              $arrayElemAt: ['$totalCount.count', 0],
            },
            0,
          ],
        },
        nextPage: {
          $cond: [
            {
              $gt: [
                {
                  $subtract: [
                    { $arrayElemAt: ['$totalCount.count', 0] },
                    skip + limit,
                  ],
                },
                0,
              ],
            },
            currentPage + 1,
            null,
          ],
        },
      },
    },
  ];
};

export interface IPaginatedResult<T> {
  paginatedResults: T[];
  totalCount: number;
  nextPage: number | null;
}
