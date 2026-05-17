{
  "product": "Peer AI : Multi-Step Agent Task Delegation",
  "primary_persona": "Dr. Priya Menon, Regulatory Affairs Lead",
  "source_prd": "/Users/adarshnellore/Documents/session-2026-05-17-1120/peer-ai-task-delegation-prd.md",
  "generated_at": "2026-05-17T20:14:59Z",
  "subtitle": "Six independent feature sketches for the launch, monitor, and supervise experience of long-running AI tasks.",
  "concepts": [
    {
      "id": "task-monitor-sidebar",
      "title": "Workspace with Task Monitor Sidebar",
      "blurb": "Drafting stays the primary surface while a docked sidebar surfaces live agent state, step progress, and streaming reasoning. Supervision happens peripherally without pulling attention away from the CTD document.",
      "proposed_route": "/tasks/:taskId",
      "layout_type": "dashboard",
      "primary_regions": [
        "banner",
        "document-editor",
        "task-monitor",
        "reasoning-trail",
        "sub-outputs"
      ],
      "agent_involvement": "summary",
      "lofi": [
        {
          "type": "topbar",
          "tooltip": "Chrome stays minimal so the editor reads as the dominant surface; the OPEN TASK MONITOR action is the only nudge toward agent supervision.",
          "left": [
            {
              "skel": 50
            }
          ],
          "right": [
            {
              "kind": "minor",
              "text": "MODULE"
            },
            {
              "kind": "minor",
              "text": "SECTION"
            }
          ],
          "actions": [
            {
              "text": "OPEN TASK MONITOR",
              "size": "sm"
            }
          ]
        },
        {
          "type": "banner",
          "tooltip": "Banners only fire when human input is truly required; routine agent progress never interrupts drafting.",
          "variant": "info",
          "label": "AWAITING EVIDENCE REVIEW",
          "labelKind": "status-needs-review",
          "line": 65,
          "actions": [
            {
              "text": "REVIEW EVIDENCE",
              "variant": "primary",
              "size": "sm"
            },
            {
              "text": "DISMISS",
              "size": "sm"
            }
          ]
        },
        {
          "type": "two-col",
          "wide": [
            {
              "type": "box",
              "size": "xl",
              "label": "DOCUMENT EDITOR",
              "tooltip": "The CTD draft is the primary working surface; the editor occupies the dominant column so supervision never displaces writing.",
              "children": [
                {
                  "type": "box",
                  "size": "sm",
                  "fill": true,
                  "tooltip": "Section heading slot for the active CTD module."
                },
                {
                  "type": "box",
                  "size": "sm",
                  "fill": true,
                  "tooltip": "Body paragraph block representing the in-progress draft."
                },
                {
                  "type": "box",
                  "size": "sm",
                  "fill": true,
                  "tooltip": "Continuation paragraph block under the active cursor."
                },
                {
                  "type": "box",
                  "size": "sm",
                  "fill": true,
                  "tooltip": "Trailing paragraph block; the editor scrolls independently of the monitor."
                }
              ]
            }
          ],
          "narrow": [
            {
              "type": "box",
              "size": "lg",
              "label": "TASK MONITOR",
              "tooltip": "The docked monitor exposes agent state without pulling the regulatory lead out of the document.",
              "children": [
                {
                  "type": "box",
                  "size": "sm",
                  "tooltip": "The state badge names the current agent activity; elapsed time keeps supervision grounded in real progress.",
                  "children": [
                    {
                      "type": "agent-block",
                      "tooltip": "State badge row pairing the live activity with an elapsed-time pill.",
                      "label": "STATE",
                      "confidence": "med",
                      "lineCount": 0,
                      "pills": [
                        {
                          "kind": "status-in-progress",
                          "text": "DRAFTING SECTION"
                        },
                        {
                          "kind": "minor",
                          "text": "ELAPSED TIME"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "box",
                  "size": "sm",
                  "tooltip": "The four-step stepper sequences evidence gathering, drafting, gap analysis, and action generation so supervision stays scannable.",
                  "children": [
                    {
                      "type": "agent-block",
                      "tooltip": "Stepper row covering EVIDENCE, DRAFT, GAPS, and ACTIONS.",
                      "label": "STEPS",
                      "confidence": "med",
                      "lineCount": 0,
                      "pills": [
                        {
                          "kind": "status-resolved",
                          "text": "EVIDENCE"
                        },
                        {
                          "kind": "status-in-progress",
                          "text": "DRAFT"
                        },
                        {
                          "kind": "minor",
                          "text": "GAPS"
                        },
                        {
                          "kind": "minor",
                          "text": "ACTIONS"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "agent-block",
                  "label": "REASONING TRAIL",
                  "tooltip": "The streaming reasoning log shows what the agent is doing right now; glanceable, not demanding.",
                  "confidence": "med",
                  "lineCount": 5,
                  "pills": [
                    {
                      "kind": "agent",
                      "text": "STREAMING"
                    }
                  ],
                  "footerPills": [
                    {
                      "kind": "minor",
                      "text": "TIMESTAMP"
                    }
                  ]
                },
                {
                  "type": "card-list",
                  "tooltip": "Sub-output cards surface evidence, draft, and gap artifacts as they become available, without forcing a context switch.",
                  "pattern": "simple",
                  "count": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "task-launcher-scope",
      "title": "Task Launcher with Scope Confirmation",
      "blurb": "Configuration form pairs picked inputs with an agent-generated plain-language restatement. Scope misalignments surface before any compute starts, replacing the burden of writing a detailed prompt.",
      "proposed_route": "/tasks/new",
      "layout_type": "form",
      "primary_regions": [
        "task-name",
        "section-selector",
        "document-multiselect",
        "style-guide",
        "scope-card",
        "launch-controls"
      ],
      "agent_involvement": "suggestion",
      "lofi": [
        {
          "type": "topbar",
          "tooltip": "Top chrome anchors the launcher modal with module and required-field context.",
          "left": [
            {
              "skel": 50
            }
          ],
          "right": [
            {
              "kind": "minor",
              "text": "MODULE"
            },
            {
              "kind": "filter-active",
              "text": "REQUIRED"
            }
          ],
          "actions": [
            {
              "text": "CLOSE",
              "size": "sm"
            }
          ]
        },
        {
          "type": "breadcrumb",
          "tooltip": "Breadcrumb supports deep-link entry from a section detail or assignment notification.",
          "depth": 2
        },
        {
          "type": "box",
          "size": "xl",
          "label": "TASK LAUNCHER",
          "tooltip": "Dominant launcher region collects task configuration and surfaces the agent restatement before compute begins.",
          "children": [
            {
              "type": "form-rows",
              "label": "TASK CONFIGURATION",
              "tooltip": "Configuration form captures task name, target CTD section, source documents, and optional style guide.",
              "rows": [
                {
                  "label": true,
                  "controls": [
                    {
                      "skel": 50
                    }
                  ]
                },
                {
                  "label": true,
                  "controls": [
                    {
                      "pill": {
                        "kind": "filter-active",
                        "text": "CTD SECTION"
                      }
                    },
                    {
                      "btn": "CHANGE",
                      "size": "sm"
                    }
                  ]
                },
                {
                  "label": true,
                  "controls": [
                    {
                      "pill": {
                        "kind": "filter",
                        "text": "SOURCE DOC"
                      }
                    },
                    {
                      "pill": {
                        "kind": "filter",
                        "text": "SOURCE DOC"
                      }
                    },
                    {
                      "pill": {
                        "kind": "filter",
                        "text": "SOURCE DOC"
                      }
                    },
                    {
                      "btn": "ADD",
                      "size": "sm"
                    }
                  ]
                },
                {
                  "label": true,
                  "controls": [
                    {
                      "pill": {
                        "kind": "minor",
                        "text": "OPTIONAL"
                      }
                    },
                    {
                      "pill": {
                        "kind": "filter",
                        "text": "STYLE GUIDE"
                      }
                    }
                  ]
                }
              ]
            },
            {
              "type": "agent-block",
              "label": "SCOPE CONFIRMATION",
              "tooltip": "Agent restates the configured task in plain language so scope misalignments surface before launch.",
              "confidence": "high",
              "lineCount": 4,
              "pills": [
                {
                  "kind": "agent",
                  "text": "AGENT RESTATEMENT"
                }
              ],
              "actions": [
                {
                  "text": "EDIT",
                  "size": "sm"
                },
                {
                  "text": "REGENERATE",
                  "size": "sm"
                }
              ],
              "footerPills": [
                {
                  "kind": "minor",
                  "text": "PLAIN LANGUAGE"
                }
              ]
            },
            {
              "type": "box",
              "size": "sm",
              "label": "LAUNCH CONTROLS",
              "tooltip": "Launch gate confirms the scope card has been reviewed before any compute is spent.",
              "children": [
                {
                  "type": "form-rows",
                  "tooltip": "Single submit row commits the task to the queue.",
                  "rows": [],
                  "submit": {
                    "text": "LAUNCH TASK"
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "evidence-review-queue",
      "title": "Evidence Review with Confidence Gradient",
      "blurb": "A focused review queue routes regulatory attention by confidence: High items clear in bulk, Low items get scrutiny, Conflicted items halt the task until resolved.",
      "proposed_route": "/tasks/:taskId/evidence",
      "layout_type": "queue",
      "primary_regions": [
        "banner",
        "filter-strip",
        "evidence-table",
        "bulk-bar"
      ],
      "agent_involvement": "candidate-match",
      "lofi": [
        {
          "type": "topbar",
          "tooltip": "Task chrome anchors the regulatory affairs lead inside the active CTD module and section while evidence review is in progress.",
          "left": [
            {
              "skel": 50
            }
          ],
          "right": [
            "MODULE",
            "SECTION"
          ],
          "actions": [
            {
              "text": "CLOSE",
              "size": "sm"
            }
          ]
        },
        {
          "type": "breadcrumb",
          "tooltip": "Breadcrumb places the evidence review inside the submission and task hierarchy so the regulatory affairs lead never loses context.",
          "depth": 3
        },
        {
          "type": "banner",
          "tooltip": "Blocking contradictions between source documents halt the task until the regulatory affairs lead adjudicates which passage governs.",
          "variant": "error",
          "label": "SOURCE CONFLICT DETECTED",
          "labelKind": "blocking",
          "line": 50,
          "actions": [
            {
              "text": "RESOLVE CONFLICT",
              "variant": "primary",
              "size": "sm"
            }
          ]
        },
        {
          "type": "filter-strip",
          "tooltip": "Confidence filters let high-support items move quickly while concentrating review effort on weak or contradictory extractions.",
          "filters": [
            {
              "kind": "filter-active",
              "text": "ALL"
            },
            "HIGH",
            "MEDIUM",
            "LOW",
            "UNVERIFIED",
            "CONFLICTED"
          ],
          "actions": [
            {
              "kind": "minor",
              "text": "SORT BY CONFIDENCE"
            }
          ]
        },
        {
          "type": "box",
          "size": "xl",
          "label": "EVIDENCE REVIEW",
          "tooltip": "The dominant review surface lists every extracted passage with source coordinates and confidence so each item gets an accept or reject decision before drafting begins.",
          "children": [
            {
              "type": "queue-table",
              "tooltip": "Each row carries a passage excerpt, its CTD section and page coordinates, agent confidence, and the per-row accept or reject decision that gates drafting.",
              "label": "EXTRACTED EVIDENCE",
              "columns": [
                "EXCERPT",
                "SECTION",
                "PAGE",
                "CONFIDENCE",
                "STATE",
                "ACTION"
              ],
              "rowCount": 7,
              "bulkBar": true,
              "bulkBarTooltip": "The bulk confirm bar accepts every High confidence item in a single action so review effort concentrates on Medium, Low, Unverified, and Conflicted rows."
            }
          ]
        }
      ]
    },
    {
      "id": "draft-with-annotations",
      "title": "Draft Review with Inline Confidence Annotations",
      "blurb": "Amber-underlined low-confidence sentences let regulatory leads skim selectively. Inline accept, flag, and edit controls keep the evidence trail intact without breaking flow.",
      "proposed_route": "/tasks/:taskId/draft",
      "layout_type": "detail",
      "primary_regions": [
        "annotated-draft",
        "evidence-sidebar",
        "sentence-actions"
      ],
      "agent_involvement": "suggestion",
      "lofi": [
        {
          "type": "topbar",
          "tooltip": "Full-screen draft review chrome showing module, section, and draft version context.",
          "left": [
            {
              "skel": 50
            }
          ],
          "right": [
            {
              "kind": "minor",
              "text": "MODULE"
            },
            {
              "kind": "minor",
              "text": "SECTION"
            },
            {
              "kind": "minor",
              "text": "DRAFT VERSION"
            }
          ],
          "actions": [
            {
              "text": "EXIT FULL-SCREEN",
              "size": "sm"
            }
          ]
        },
        {
          "type": "breadcrumb",
          "tooltip": "Three-level path back to the parent task and section context.",
          "depth": 3
        },
        {
          "type": "filter-strip",
          "tooltip": "Filters narrow review to only the sentences that need attention.",
          "filters": [
            {
              "kind": "filter-active",
              "text": "ALL SENTENCES"
            },
            "LOW CONFIDENCE ONLY",
            "FLAGGED",
            "EDITED"
          ],
          "actions": [
            {
              "kind": "agent",
              "text": "AGENT DRAFT"
            }
          ]
        },
        {
          "type": "two-col",
          "wide": [
            {
              "type": "box",
              "size": "xl",
              "label": "ANNOTATED DRAFT",
              "tooltip": "Sentence-by-sentence draft with amber underlines marking low-confidence claims for selective review.",
              "children": [
                {
                  "type": "agent-block",
                  "label": "SENTENCE",
                  "tooltip": "High-confidence sentence rendered plain with per-sentence review controls.",
                  "confidence": "high",
                  "lineCount": 2,
                  "pills": [
                    {
                      "kind": "confidence-high",
                      "text": "CONFIDENCE"
                    }
                  ],
                  "actions": [
                    {
                      "text": "ACCEPT",
                      "size": "sm"
                    },
                    {
                      "text": "FLAG",
                      "size": "sm"
                    },
                    {
                      "text": "EDIT",
                      "size": "sm"
                    }
                  ],
                  "footerPills": [
                    {
                      "kind": "minor",
                      "text": "EVIDENCE ITEM ID"
                    }
                  ]
                },
                {
                  "type": "agent-block",
                  "label": "SENTENCE",
                  "tooltip": "Low-confidence sentence carries an amber underline and per-sentence review controls.",
                  "confidence": "low",
                  "lineCount": 2,
                  "pills": [
                    {
                      "kind": "confidence-low",
                      "text": "CONFIDENCE"
                    }
                  ],
                  "actions": [
                    {
                      "text": "ACCEPT",
                      "size": "sm"
                    },
                    {
                      "text": "FLAG",
                      "size": "sm"
                    },
                    {
                      "text": "EDIT",
                      "size": "sm"
                    }
                  ],
                  "footerPills": [
                    {
                      "kind": "minor",
                      "text": "EVIDENCE ITEM ID"
                    }
                  ]
                },
                {
                  "type": "agent-block",
                  "label": "SENTENCE",
                  "tooltip": "Medium-confidence sentence surfaces the same per-sentence review controls.",
                  "confidence": "med",
                  "lineCount": 2,
                  "pills": [
                    {
                      "kind": "confidence-med",
                      "text": "CONFIDENCE"
                    }
                  ],
                  "actions": [
                    {
                      "text": "ACCEPT",
                      "size": "sm"
                    },
                    {
                      "text": "FLAG",
                      "size": "sm"
                    },
                    {
                      "text": "EDIT",
                      "size": "sm"
                    }
                  ],
                  "footerPills": [
                    {
                      "kind": "minor",
                      "text": "EVIDENCE ITEM ID"
                    }
                  ]
                },
                {
                  "type": "box",
                  "size": "sm",
                  "tooltip": "Placeholder node the agent inserts when no evidence supports a claim.",
                  "children": [
                    {
                      "type": "filter-strip",
                      "tooltip": "Blocking signal that the claim lacks supporting evidence.",
                      "filters": [
                        {
                          "kind": "blocking",
                          "text": "CLAIM NOT SUPPORTED"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          "narrow": [
            {
              "type": "box",
              "size": "lg",
              "label": "EVIDENCE SIDEBAR",
              "tooltip": "Source passage backing the currently selected sentence.",
              "children": [
                {
                  "type": "box",
                  "size": "sm",
                  "tooltip": "Source coordinates locating the passage inside the underlying document.",
                  "children": [
                    {
                      "type": "filter-strip",
                      "tooltip": "Document, page, and section reference for the selected evidence item.",
                      "filters": [
                        {
                          "kind": "minor",
                          "text": "SOURCE DOC"
                        },
                        {
                          "kind": "minor",
                          "text": "PAGE"
                        },
                        {
                          "kind": "minor",
                          "text": "SECTION REF"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "agent-block",
                  "label": "PASSAGE EXCERPT",
                  "tooltip": "Supporting passage backing the selected sentence with its confidence tier.",
                  "confidence": "high",
                  "lineCount": 4,
                  "pills": [
                    {
                      "kind": "confidence-high",
                      "text": "HIGH"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "gap-review-severity",
      "title": "Gap Review with Severity Adjustment",
      "blurb": "Surfaces every flagged gap in one queue with disclosed regulatory basis and knowledge date. Critical gaps require explicit acknowledgement; Minor gaps clear in a single batch action.",
      "proposed_route": "/tasks/:taskId/gaps",
      "layout_type": "queue",
      "primary_regions": [
        "kpi-strip",
        "filter-strip",
        "gap-table",
        "batch-acknowledge"
      ],
      "agent_involvement": "suggestion",
      "lofi": [
        {
          "type": "topbar",
          "tooltip": "Chrome anchoring the gap review to its parent module and section context.",
          "left": [
            {
              "skel": 50
            }
          ],
          "right": [
            {
              "kind": "minor",
              "text": "MODULE"
            },
            {
              "kind": "minor",
              "text": "SECTION"
            }
          ],
          "actions": [
            {
              "text": "CLOSE",
              "size": "sm"
            }
          ]
        },
        {
          "type": "breadcrumb",
          "tooltip": "Path from the submission back through the section to this review surface.",
          "depth": 3
        },
        {
          "type": "kpi-strip",
          "tiles": [
            {
              "label": "CRITICAL",
              "alert": true,
              "tooltip": "Count of Critical gaps requiring acknowledgement."
            },
            {
              "label": "NOTABLE",
              "tooltip": "Count of Notable gaps."
            },
            {
              "label": "MINOR",
              "tooltip": "Count of Minor gaps eligible for batch acknowledge."
            },
            {
              "label": "UNCERTAINTY FLAGS",
              "tooltip": "Gaps where the agent could not determine regulatory expectation."
            }
          ]
        },
        {
          "type": "filter-strip",
          "tooltip": "Severity filters narrow the queue to one tier at a time.",
          "filters": [
            {
              "kind": "filter-active",
              "text": "ALL"
            },
            {
              "kind": "high",
              "text": "CRITICAL"
            },
            {
              "kind": "medium",
              "text": "NOTABLE"
            },
            {
              "kind": "minor",
              "text": "MINOR"
            }
          ],
          "actions": [
            {
              "kind": "minor",
              "text": "GROUP BY SECTION"
            }
          ]
        },
        {
          "type": "box",
          "size": "xl",
          "label": "GAP REVIEW",
          "tooltip": "Dominant review surface listing every identified gap with its severity, basis, and override control.",
          "children": [
            {
              "type": "queue-table",
              "label": "IDENTIFIED GAPS",
              "tooltip": "Per-gap severity override control lets the reviewer raise or lower the agent's assigned tier with a recorded rationale.",
              "columns": [
                "CLAIM",
                "GAP DESCRIPTION",
                "SEVERITY",
                "REGULATORY BASIS",
                "KNOWLEDGE DATE",
                "ACTION"
              ],
              "rowCount": 6,
              "bulkBar": true,
              "bulkBarTooltip": "Batch acknowledge applies only to Minor gaps; Critical and Notable rows remain individually actionable."
            }
          ]
        }
      ]
    },
    {
      "id": "action-approval-batch",
      "title": "Action Approval with Batch and Per-Item Controls",
      "blurb": "Generated action items pause for review before any tracker write. Routine items batch-approve in one click; sensitive items keep per-card owner and urgency edits.",
      "proposed_route": "/tasks/:taskId/actions",
      "layout_type": "queue",
      "primary_regions": [
        "banner",
        "filter-strip",
        "action-list",
        "commit-bar"
      ],
      "agent_involvement": "suggestion",
      "lofi": [
        {
          "type": "topbar",
          "tooltip": "Chrome bar anchoring the approval surface inside the task delegation workspace.",
          "left": [
            {
              "skel": 50
            }
          ],
          "right": [
            {
              "kind": "minor",
              "text": "MODULE"
            },
            {
              "kind": "minor",
              "text": "SECTION"
            }
          ],
          "actions": [
            {
              "text": "CLOSE",
              "size": "sm"
            }
          ]
        },
        {
          "type": "breadcrumb",
          "tooltip": "Three-level path locating the current task inside its parent submission and module.",
          "depth": 3
        },
        {
          "type": "banner",
          "tooltip": "Approval gate that holds the generated action items until a reviewer commits or dismisses before any tracker write.",
          "variant": "info",
          "label": "AWAITING ACTION APPROVAL",
          "labelKind": "status-needs-review",
          "line": 50,
          "actions": [
            {
              "text": "COMMIT TO TRACKER",
              "variant": "primary",
              "size": "sm"
            },
            {
              "text": "DISMISS",
              "size": "sm"
            }
          ]
        },
        {
          "type": "filter-strip",
          "tooltip": "Urgency filters narrow the action list by relative deadline pressure against the submission timeline.",
          "filters": [
            {
              "kind": "filter-active",
              "text": "ALL"
            },
            {
              "kind": "high",
              "text": "HIGH"
            },
            {
              "kind": "medium",
              "text": "MEDIUM"
            },
            {
              "kind": "minor",
              "text": "LOW"
            }
          ],
          "actions": [
            {
              "kind": "minor",
              "text": "GROUP BY OWNER"
            }
          ]
        },
        {
          "type": "box",
          "size": "xl",
          "label": "ACTION APPROVAL",
          "tooltip": "Dominant region holding the generated action items pending reviewer approval before any tracker commit.",
          "children": [
            {
              "type": "card-list",
              "tooltip": "Per-action cards show gap origin, agent owner suggestion as initials, urgency, and inline controls to edit owner, edit urgency, or dismiss.",
              "cardTooltip": "Single action item card with gap origin, agent-recommended owner initials, urgency pill, and per-item edit and dismiss controls.",
              "count": 6,
              "pattern": "assignment"
            },
            {
              "type": "box",
              "size": "sm",
              "label": "COMMIT BAR",
              "tooltip": "Commit gate that batches routine approvals and writes the approved items to the tracker in a single action.",
              "children": [
                {
                  "type": "form-rows",
                  "tooltip": "Footer row combining the batch-approve control, the pending review indicator, and the final commit button.",
                  "rows": [
                    {
                      "controls": [
                        {
                          "pill": {
                            "kind": "agent",
                            "text": "BATCH APPROVE ROUTINE"
                          }
                        },
                        {
                          "pill": {
                            "kind": "high",
                            "text": "PENDING REVIEW"
                          }
                        },
                        {
                          "btn": "COMMIT TO TRACKER",
                          "variant": "primary"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}