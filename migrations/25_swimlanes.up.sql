CREATE TABLE public.swimlanes
(
    workspace_id          uuid                     NOT NULL,
    board_id              uuid                     NOT NULL,
    id                    uuid                     NOT NULL,
    rank                  varchar                  not null,
    title                 varchar                  NOT NULL,
    "description"         varchar                  not null,
    created_by_name       varchar                  NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE not null,
    last_modified         TIMESTAMP WITH TIME ZONE not null,
    last_modified_by_name varchar                  not null,
    color                 varchar                  NOT NULL,
    CONSTRAINT "PK_swimlanes" PRIMARY KEY (workspace_id, id),
    CONSTRAINT "UN_swimlanes_1" UNIQUE (workspace_id, board_id, rank),
    CONSTRAINT "FK_swimlanes_1" FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
    CONSTRAINT "FK_swimlanes_2" FOREIGN KEY (workspace_id, board_id) REFERENCES kanbanboards (workspace_id, id) ON DELETE CASCADE
)
    WITH (
        OIDS= FALSE
    );
