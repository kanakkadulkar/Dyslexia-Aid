import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  observation: {
    fontSize: 12,
    marginBottom: 5,
    paddingLeft: 10,
  },
});

const ReportPDF = ({ assessment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Dyslexia Assessment Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assessment Date</Text>
        <Text style={styles.text}>
          {new Date(assessment.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Analysis</Text>
        <Text style={styles.text}>
          {assessment.analysis.overallAnalysis}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>
        {assessment.analysis.detailedAnalysis.map((item, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.text}>{item.description}</Text>
            {item.observations && item.observations.map((obs, obsIndex) => (
              <Text key={obsIndex} style={styles.observation}>• {obs}</Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {assessment.analysis.recommendations.map((rec, index) => (
          <Text key={index} style={styles.observation}>• {rec}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Steps</Text>
        {assessment.analysis.nextSteps.map((step, index) => (
          <Text key={index} style={styles.observation}>• {step}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default ReportPDF; 