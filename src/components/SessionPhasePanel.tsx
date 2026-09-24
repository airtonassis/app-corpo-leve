import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionPreparationPlan } from '../services/workout/sessionPreparationEngine';
import { colors, radius, spacing, typography, shadow } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';

export function SessionPhasePanel({ step, plan, buttonLabel, onContinue }: { step:'01'|'03'; plan:SessionPreparationPlan; buttonLabel:string; onContinue:()=>void }) {
  return <View style={[styles.card, shadow.card]}>
    <Text style={styles.eyebrow}>{step} · {plan.title.toUpperCase()}</Text>
    <Text style={styles.title}>{plan.title}</Text>
    <Text style={styles.subtitle}>≈ {plan.estimatedMinutes} min · Faça tudo em ritmo confortável. Não é uma competição.</Text>
    {plan.items.map((item, index) => <View key={item.id} style={styles.item}>
      <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
      <View style={{flex:1}}><Text style={styles.itemTitle}>{item.title} · {item.seconds}s</Text><Text style={styles.itemText}>{item.instruction}</Text></View>
    </View>)}
    <View style={styles.pending}><Text style={styles.pendingTitle}>Conteúdo em validação técnica</Text><Text style={styles.pendingText}>A preparação e o retorno à calma desta versão ainda serão revisados pelo Profissional de Educação Física antes da comercialização.</Text></View>
    <PrimaryButton label={buttonLabel} onPress={onContinue} style={{marginTop:spacing.lg}} />
  </View>;
}
const styles=StyleSheet.create({
  card:{backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.lg}, eyebrow:{...typography.caption,fontWeight:'900',color:colors.primaryDark,letterSpacing:.8},
  title:{...typography.h1,marginTop:spacing.xs},subtitle:{...typography.bodyMuted,lineHeight:20,marginTop:spacing.xs,marginBottom:spacing.md},
  item:{flexDirection:'row',gap:spacing.sm,paddingVertical:spacing.md,borderTopWidth:1,borderTopColor:colors.border},number:{width:28,height:28,borderRadius:14,backgroundColor:colors.primaryLight,alignItems:'center',justifyContent:'center'},numberText:{fontWeight:'900',color:colors.primaryDark},itemTitle:{...typography.body,fontWeight:'800'},itemText:{...typography.caption,lineHeight:18,marginTop:3},pending:{marginTop:spacing.md,padding:spacing.md,borderRadius:radius.md,backgroundColor:colors.surfaceAlt},pendingTitle:{...typography.caption,fontWeight:'900',color:colors.primaryDark},pendingText:{...typography.caption,lineHeight:17,marginTop:3}
});
