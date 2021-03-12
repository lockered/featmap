CREATE TABLE public.kanbanboards
(
    workspace_id          uuid                     NOT NULL ,
    id                    uuid                     NOT NULL,
    title                 varchar                  NOT NULL,
    "description"         varchar                  not null,
    created_by_name       varchar                  NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE not null,
    last_modified         TIMESTAMP WITH TIME ZONE not null,
    last_modified_by_name varchar                  not null,
    CONSTRAINT "PK_kanbanboards_1" PRIMARY KEY (workspace_id, id),
    CONSTRAINT "FK_kanbanboards_1" FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
    CONSTRAINT "FK_kanbanboards_2" FOREIGN KEY (workspace_id, created_by) REFERENCES members (workspace_id, id) ON DELETE SET NULL
)
    WITH (
        OIDS= FALSE
    );
