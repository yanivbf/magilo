// Test to verify section cleaning logic

const testSection = {
	id: 123,
	documentId: "abc123xyz",
	type: "about",
	enabled: true,
	data: {
		id: 456,
		documentId: "def456uvw",
		title: "אודות",
		description: "תיאור"
	}
};

console.log('📦 Original section:', JSON.stringify(testSection, null, 2));

// Apply the cleaning logic
const { documentId: sectionDocId, ...cleanSection } = testSection;

// Clean nested data
if (cleanSection.data && typeof cleanSection.data === 'object') {
	const { documentId: dataDocId, ...cleanData } = cleanSection.data;
	cleanSection.data = cleanData;
}

console.log('\n🧹 Cleaned section:', JSON.stringify(cleanSection, null, 2));
console.log('\n✅ Has numeric id?', cleanSection.id !== undefined);
console.log('✅ Has documentId?', cleanSection.documentId !== undefined);
console.log('✅ Data has numeric id?', cleanSection.data.id !== undefined);
console.log('✅ Data has documentId?', cleanSection.data.documentId !== undefined);
