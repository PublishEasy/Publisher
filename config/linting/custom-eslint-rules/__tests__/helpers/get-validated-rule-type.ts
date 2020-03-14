export function getValidatedRuleType(
  ruleType: string,
): 'problem' | 'suggestion' | 'layout' {
  if (
    ruleType === 'problem' ||
    ruleType === 'suggestion' ||
    ruleType === 'layout'
  )
    return ruleType;
  throw new Error(`invalid ruleType ${ruleType}`);
}
