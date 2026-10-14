export type ModelsStatisticsDto = Record<string, {
  iteration: number,
  success: number,
  failures: number
}>;
