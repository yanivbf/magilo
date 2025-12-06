<script>
	import { getContext } from 'svelte';
	import EditableText from '$lib/components/editing/EditableText.svelte';
	import EditableImage from '$lib/components/editing/EditableImage.svelte';
	
	let { data, sectionIndex = 0 } = $props();
	
	const editMode = getContext('editMode');
	const pageId = getContext('pageId');
	const saveField = getContext('saveField');
	
	let members = $state(data.members || []);
	
	async function saveMemberField(index, field, value) {
		members = members.map((m, i) => 
			i === index ? { ...m, [field]: value } : m
		);
		await saveField(`sections.${sectionIndex}.data.members`, members);
	}
	
	async function handleImageUpload(index, file) {
		const uploadFormData = new FormData();
		uploadFormData.append('image', file);
		uploadFormData.append('userId', 'temp');
		uploadFormData.append('pageName', 'team');
		
		const uploadResponse = await fetch('/api/upload-image', {
			method: 'POST',
			body: uploadFormData
		});
		
		if (!uploadResponse.ok) {
			throw new Error('Failed to upload image');
		}
		
		const uploadResult = await uploadResponse.json();
		const imageUrl = uploadResult.url;
		
		members = members.map((m, i) => 
			i === index ? { ...m, image: imageUrl } : m
		);
		
		await saveField(`sections.${sectionIndex}.data.members`, members);
		
		return imageUrl;
	}
	
	async function addMember() {
		members = [...members, {
			name: 'שם חבר צוות',
			role: 'תפקיד',
			bio: 'תיאור קצר',
			image: ''
		}];
		await saveField(`sections.${sectionIndex}.data.members`, members);
	}
	
	async function deleteMember(index) {
		if (!confirm('האם למחוק את חבר הצוות?')) return;
		members = members.filter((_, i) => i !== index);
		await saveField(`sections.${sectionIndex}.data.members`, members);
	}
</script>

<section class="team-section">
	<div class="container">
		<EditableText
			value={data.title || 'הצוות שלנו'}
			onsave={(value) => saveField(`sections.${sectionIndex}.data.title`, value)}
			class="section-title"
			tag="h2"
		/>
		{#if data.subtitle || editMode}
			<EditableText
				value={data.subtitle || 'תת כותרת'}
				onsave={(value) => saveField(`sections.${sectionIndex}.data.subtitle`, value)}
				class="section-subtitle"
				tag="p"
			/>
		{/if}
		
		<div class="team-grid">
			{#each members as member, index}
				<div class="team-card" style="--delay: {index * 0.1}s">
					{#if editMode}
						<button class="delete-btn" onclick={() => deleteMember(index)} title="מחק">
							🗑️
						</button>
					{/if}
					
					<div class="member-image">
						<EditableImage
							src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=300&background=667eea&color=fff&bold=true`}
							alt={member.name}
							onUpload={(file) => handleImageUpload(index, file)}
							className="avatar"
						/>
					</div>
					
					<EditableText
						value={member.name}
						onsave={(value) => saveMemberField(index, 'name', value)}
						class="member-name"
						tag="h3"
					/>
					
					<EditableText
						value={member.role}
						onsave={(value) => saveMemberField(index, 'role', value)}
						class="member-role"
						tag="div"
					/>
					
					<EditableText
						value={member.bio || 'תיאור'}
						onsave={(value) => saveMemberField(index, 'bio', value)}
						class="member-bio"
						tag="p"
					/>
				</div>
			{/each}
			
			{#if editMode}
				<button class="add-member-btn" onclick={addMember}>
					<div class="add-icon">➕</div>
					<div class="add-text">הוסף חבר צוות</div>
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.team-section {
		padding: 3rem 0;
		background: white;
		direction: rtl;
	}
	
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}
	
	.section-title {
		text-align: center;
		font-size: 3rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 1rem;
	}
	
	.section-subtitle {
		text-align: center;
		font-size: 1.3rem;
		color: #6b7280;
		margin-bottom: 4rem;
	}
	
	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
		justify-content: center;
		max-width: 900px;
		margin: 0 auto;
	}
	
	.team-card {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 1.5rem;
		border-radius: 16px;
		text-align: center;
		transition: all 0.4s ease;
		position: relative;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
	}
	
	.team-card:hover {
		transform: translateY(-10px);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
	}
	
	.delete-btn {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 10;
		background: rgba(239, 68, 68, 0.95);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
	}
	
	.delete-btn:hover {
		transform: scale(1.1);
		background: rgba(220, 38, 38, 1);
	}
	
	.member-image {
		width: 100px;
		height: 100px;
		margin: 0 auto 1rem;
		border-radius: 50%;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}
	
	.member-image :global(.editable-image-wrapper) {
		width: 100%;
		height: 100%;
	}
	
	.avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.member-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}
	
	.member-role {
		font-size: 0.9rem;
		font-weight: 600;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.75rem;
	}
	
	.member-bio {
		font-size: 0.85rem;
		color: #6b7280;
		line-height: 1.4;
	}
	
	.add-member-btn {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		border: 3px dashed #667eea;
		border-radius: 16px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
		min-height: 250px;
	}
	
	.add-member-btn:hover {
		transform: translateY(-10px);
		border-color: #764ba2;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
	}
	
	.add-icon {
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.add-text {
		font-size: 1rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}
		
		.team-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
