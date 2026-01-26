"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowRight, ArrowLeft, Users } from "lucide-react";
import type { Step2Data, TargetPersona } from "../CreateAgentForm";

interface ReviewStepProps {
  form: UseFormReturn<Step2Data>;
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
  competitors: string[];
  setCompetitors: (competitors: string[]) => void;
  targetPersonas: TargetPersona[];
  setTargetPersonas: (personas: TargetPersona[]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ReviewStep({
  form,
  keywords,
  setKeywords,
  competitors,
  setCompetitors,
  targetPersonas,
  setTargetPersonas,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [personaTitleInput, setPersonaTitleInput] = useState("");
  const [personaDescInput, setPersonaDescInput] = useState("");
  const [showAddPersona, setShowAddPersona] = useState(false);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 20) {
      const newKeywords = [...keywords, trimmed];
      setKeywords(newKeywords);
      form.setValue("keywords", newKeywords);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = keywords.filter((k) => k !== keyword);
    setKeywords(newKeywords);
    form.setValue("keywords", newKeywords);
  };

  const handleAddCompetitor = () => {
    const trimmed = competitorInput.trim();
    if (trimmed && !competitors.includes(trimmed) && competitors.length < 3) {
      const newCompetitors = [...competitors, trimmed];
      setCompetitors(newCompetitors);
      form.setValue("competitors", newCompetitors);
      setCompetitorInput("");
    }
  };

  const handleRemoveCompetitor = (competitor: string) => {
    const newCompetitors = competitors.filter((c) => c !== competitor);
    setCompetitors(newCompetitors);
    form.setValue("competitors", newCompetitors);
  };

  const handleAddPersona = () => {
    const title = personaTitleInput.trim();
    const description = personaDescInput.trim();
    if (title && description && targetPersonas.length < 6) {
      const newPersonas = [...targetPersonas, { title, description }];
      setTargetPersonas(newPersonas);
      setPersonaTitleInput("");
      setPersonaDescInput("");
      setShowAddPersona(false);
    }
  };

  const handleRemovePersona = (index: number) => {
    const newPersonas = targetPersonas.filter((_, i) => i !== index);
    setTargetPersonas(newPersonas);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & customize
        </h2>
        <p className="text-gray-600">
          We analyzed your website. Edit the description and keywords, then add
          competitors.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Product Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what your product does..."
          {...form.register("description")}
          className="min-h-[100px]"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Target Personas (ICP) */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Target Audience (ICP)
          </span>
          <span className="text-sm text-gray-500 font-normal">
            {targetPersonas.length}/6
          </span>
        </Label>
        <p className="text-sm text-gray-500">
          Who are your ideal customers? Add or remove personas.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {targetPersonas.map((persona, idx) => (
            <div
              key={idx}
              className="relative bg-orange-50 border border-orange-200 rounded-xl p-4 pr-10"
            >
              <button
                type="button"
                onClick={() => handleRemovePersona(idx)}
                className="absolute top-2 right-2 p-1 hover:bg-orange-200 rounded-full text-orange-600"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-semibold text-gray-900">{persona.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {persona.description}
              </p>
            </div>
          ))}
        </div>

        {/* Add Persona Form */}
        {showAddPersona ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <Input
              placeholder="Job title (e.g., SaaS Founder)"
              value={personaTitleInput}
              onChange={(e) => setPersonaTitleInput(e.target.value)}
              className="h-10"
            />
            <Input
              placeholder="Short description"
              value={personaDescInput}
              onChange={(e) => setPersonaDescInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPersona();
                }
              }}
              className="h-10"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddPersona(false);
                  setPersonaTitleInput("");
                  setPersonaDescInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddPersona}
                disabled={!personaTitleInput.trim() || !personaDescInput.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Persona
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddPersona(true)}
            disabled={targetPersonas.length >= 6}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Persona
          </Button>
        )}
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label className="flex items-center justify-between">
          <span>Target Keywords</span>
          <span className="text-sm text-gray-500 font-normal">
            {keywords.length}/20
          </span>
        </Label>
        <p className="text-sm text-gray-500">
          Keywords people would search for when looking for your product.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Add a keyword..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            className="h-10"
            disabled={keywords.length >= 20}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddKeyword}
            className="h-10 w-10 shrink-0"
            disabled={keywords.length >= 20}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {form.formState.errors.keywords && (
          <p className="text-sm text-red-500">
            {form.formState.errors.keywords.message}
          </p>
        )}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="bg-orange-100 text-orange-700 hover:bg-orange-200 pr-1"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-1 p-1 hover:bg-orange-300 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Competitors */}
      <div className="space-y-2">
        <Label className="flex items-center justify-between">
          <span>
            Competitors{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </span>
          <span className="text-sm text-gray-500 font-normal">
            {competitors.length}/3
          </span>
        </Label>
        <p className="text-sm text-gray-500">
          Names of competing products (we&apos;ll find people looking for
          alternatives).
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Notion, Trello"
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCompetitor();
              }
            }}
            className="h-10"
            disabled={competitors.length >= 3}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCompetitor}
            className="h-10 w-10 shrink-0"
            disabled={competitors.length >= 3}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {competitors.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {competitors.map((competitor) => (
              <Badge
                key={competitor}
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 pr-1"
              >
                {competitor}
                <button
                  type="button"
                  onClick={() => handleRemoveCompetitor(competitor)}
                  className="ml-1 p-1 hover:bg-blue-300 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={keywords.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

