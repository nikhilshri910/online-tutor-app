import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminHomeContent,
  updateHomeContentSection,
  uploadHomeLogo
} from "../features/site-content/contentService";
import { useNotification } from "../features/shared/notifications/NotificationContext";
import SideNav from "../features/shared/ui/SideNav";
import Button from "../features/shared/ui/Button";
import BrandingSection from "../features/site-content/editor/BrandingSection";
import HeroSection from "../features/site-content/editor/HeroSection";
import ObjectListSection from "../features/site-content/editor/ObjectListSection";
import LinesSection from "../features/site-content/editor/LinesSection";
import FieldsSection from "../features/site-content/editor/FieldsSection";
import { deepClone, normalizeContent } from "../features/site-content/editor/editorUtils";
import { DEFAULT_HOME_CONTENT } from "../features/site-content/defaultHomeContent";

const EDITOR_SECTIONS = [
  { id: "branding", label: "Branding" },
  { id: "hero", label: "Hero" },
  { id: "programs", label: "Programs" },
  { id: "comparison", label: "Traditional vs Flipped" },
  { id: "problemSolution", label: "Problem & Solution" },
  { id: "flipSteps", label: "Flip Steps" },
  { id: "professionals", label: "Professionals" },
  { id: "outcomes", label: "Outcomes" },
  { id: "journeys", label: "Journey Snapshots" },
  { id: "enquiry", label: "Enquiry CTA" },
  { id: "faq", label: "FAQ" },
  { id: "footer", label: "Footer" }
];

export default function HomeContentEditorPage() {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(EDITOR_SECTIONS[0].id);
  const [content, setContent] = useState(deepClone(DEFAULT_HOME_CONTENT));

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const serverContent = (await fetchAdminHomeContent()) || DEFAULT_HOME_CONTENT;
        if (isMounted) {
          setContent(normalizeContent(serverContent));
        }
      } catch (_err) {
        if (isMounted) {
          setContent(normalizeContent(DEFAULT_HOME_CONTENT));
          notification.error("Failed to load homepage content.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [notification]);

  const activeSection = useMemo(
    () => EDITOR_SECTIONS.find((item) => item.id === activeSectionId) || EDITOR_SECTIONS[0],
    [activeSectionId]
  );

  function setSectionField(sectionKey, fieldName, value) {
    setContent((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldName]: value
      }
    }));
  }

  async function handleSaveCurrentSection(event) {
    event.preventDefault();
    const sectionId = activeSection.id;
    let payload = null;

    if (sectionId === "branding") {
      payload = content.appMeta;
    } else {
      payload = content[sectionId];
    }

    setSaving(true);
    try {
      const result = await updateHomeContentSection(sectionId, payload);
      const nextValue = result.section;
      setContent((prev) => {
        const next = { ...prev };
        if (sectionId === "branding") {
          next.appMeta = { ...(prev.appMeta || {}), ...(nextValue || {}) };
        } else {
          next[sectionId] = nextValue;
        }
        return next;
      });
      notification.success(`${activeSection.label} updated.`);
    } catch (error) {
      notification.error(error?.response?.data?.message || "Failed to update section.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file) {
    setUploadingLogo(true);
    try {
      const result = await uploadHomeLogo(file);
      setContent((prev) => ({
        ...prev,
        appMeta: {
          ...(prev.appMeta || {}),
          logoUrl: result.logoUrl || prev.appMeta?.logoUrl || ""
        }
      }));
      notification.success("Logo uploaded successfully.");
    } catch (error) {
      notification.error(error?.response?.data?.message || "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading content editor...</p>
        </div>
      </div>
    );
  }

  function updateSectionData(sectionKey, nextValue) {
    setContent((prev) => ({ ...prev, [sectionKey]: nextValue }));
  }

  return (
    <div className="page">
      <section className="card panel">
        <h1>Homepage Content Editor</h1>
        <p className="muted">
          Manage homepage content section-wise from this console. Changes go live as soon as you
          save.
        </p>
      </section>

      <div className="content-console-layout">
        <aside className="card panel content-console-sidebar-card">
          <h3>Sections</h3>
          <SideNav items={EDITOR_SECTIONS} activeId={activeSectionId} onChange={setActiveSectionId} />
        </aside>

        <form className="card panel content-console-content-card" onSubmit={handleSaveCurrentSection}>
          <div className="content-console-content-header">
            <div>
              <h2>{activeSection.label}</h2>
              <p className="muted">Edit this section and save only this section via dedicated API.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Section"}
            </Button>
          </div>

          {activeSection.id === "branding" ? (
            <BrandingSection
              value={content.appMeta}
              uploadingLogo={uploadingLogo}
              onUploadLogo={handleLogoUpload}
              onChange={(fieldName, fieldValue) =>
                setContent((prev) => ({
                  ...prev,
                  appMeta: { ...(prev.appMeta || {}), [fieldName]: fieldValue }
                }))
              }
            />
          ) : null}

          {activeSection.id === "hero" ? (
            <HeroSection value={content.hero} onChange={(fieldName, fieldValue) => setSectionField("hero", fieldName, fieldValue)} />
          ) : null}

          {activeSection.id === "programs" ? (
            <ObjectListSection
              title="Programs"
              items={content.programs}
              onChange={(value) => updateSectionData("programs", value)}
              createItem={() => ({ title: "", description: "" })}
              fields={[
                { name: "title", label: "Title" },
                { name: "description", label: "Description", type: "textarea" }
              ]}
            />
          ) : null}

          {activeSection.id === "comparison" ? (
            <LinesSection
              labels={[
                "Traditional Classroom Points (one per line)",
                "Flipped Classroom Points (one per line)"
              ]}
              values={[content.comparison.traditional, content.comparison.flipped]}
              onChange={(index, nextLines) =>
                setContent((prev) => ({
                  ...prev,
                  comparison: {
                    ...(prev.comparison || {}),
                    [index === 0 ? "traditional" : "flipped"]: nextLines
                  }
                }))
              }
            />
          ) : null}

          {activeSection.id === "problemSolution" ? (
            <LinesSection
              labels={["Problem Points (one per line)", "Solution Points (one per line)"]}
              values={[content.problemSolution.problem, content.problemSolution.solution]}
              onChange={(index, nextLines) =>
                setContent((prev) => ({
                  ...prev,
                  problemSolution: {
                    ...(prev.problemSolution || {}),
                    [index === 0 ? "problem" : "solution"]: nextLines
                  }
                }))
              }
            />
          ) : null}

          {activeSection.id === "flipSteps" ? (
            <ObjectListSection
              title="Flip Steps"
              items={content.flipSteps}
              onChange={(value) => updateSectionData("flipSteps", value)}
              createItem={() => ({ step: "", title: "", detail: "" })}
              fields={[
                { name: "step", label: "Step Number" },
                { name: "title", label: "Title" },
                { name: "detail", label: "Detail", type: "textarea" }
              ]}
            />
          ) : null}

          {activeSection.id === "professionals" ? (
            <ObjectListSection
              title="Professionals"
              items={content.professionals}
              onChange={(value) => updateSectionData("professionals", value)}
              createItem={() => ({ name: "", role: "", experience: "", focus: "" })}
              fields={[
                { name: "name", label: "Name" },
                { name: "role", label: "Role" },
                { name: "experience", label: "Experience" },
                { name: "focus", label: "Focus" }
              ]}
            />
          ) : null}

          {activeSection.id === "outcomes" ? (
            <LinesSection
              labels={["Outcomes (one per line)"]}
              values={[content.outcomes]}
              onChange={(_index, nextLines) => updateSectionData("outcomes", nextLines)}
            />
          ) : null}

          {activeSection.id === "journeys" ? (
            <ObjectListSection
              title="Journey Snapshots"
              items={content.journeys}
              onChange={(value) => updateSectionData("journeys", value)}
              createItem={() => ({
                learner: "",
                classLevel: "",
                beforeScore: "",
                afterScore: "",
                formula: ""
              })}
              fields={[
                { name: "learner", label: "Learner" },
                { name: "classLevel", label: "Class Level" },
                { name: "beforeScore", label: "Before Score" },
                { name: "afterScore", label: "After Score" },
                { name: "formula", label: "Success Formula" }
              ]}
            />
          ) : null}

          {activeSection.id === "enquiry" ? (
            <FieldsSection
              value={content.enquiry}
              onChange={(fieldName, fieldValue) => setSectionField("enquiry", fieldName, fieldValue)}
              fields={[
                { name: "title", label: "Enquiry Title" },
                { name: "subtitle", label: "Enquiry Subtitle", type: "textarea" }
              ]}
            />
          ) : null}

          {activeSection.id === "faq" ? (
            <ObjectListSection
              title="FAQ"
              items={content.faq}
              onChange={(value) => updateSectionData("faq", value)}
              createItem={() => ({ question: "", answer: "" })}
              fields={[
                { name: "question", label: "Question" },
                { name: "answer", label: "Answer", type: "textarea" }
              ]}
            />
          ) : null}

          {activeSection.id === "footer" ? (
            <FieldsSection
              value={content.footer}
              onChange={(fieldName, fieldValue) => setSectionField("footer", fieldName, fieldValue)}
              fields={[
                { name: "summary", label: "Footer Summary", type: "textarea" },
                { name: "note", label: "Footer Note", type: "textarea" }
              ]}
            />
          ) : null}
        </form>
      </div>
    </div>
  );
}

