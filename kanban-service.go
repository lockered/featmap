package main

import (
	"log"
	"time"

	"github.com/pkg/errors"
)

// KanbanService ...
type KanbanService interface {
	CreateKanbanBoardWithID(id string, title string) (*KanbanBoard, error)
	GetKanbanBoard(id string) *KanbanBoard
	GetKanbanBoards() []*KanbanBoard

	CreateSwimLaneWithID(id string, title string) (*SwimLane, error)
	GetSwimLane(id string) *SwimLane
	GetSwimLanesByBoard(id string) []*SwimLane
}

// Boards
func (s *service) CreateKanbanBoardWithID(id string, title string) (*KanbanBoard, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	kk, err := s.r.GetKanbanBoard(s.Member.WorkspaceID, id)
	if kk != nil {
		return nil, errors.New("already exist")
	}

	k := &KanbanBoard{
		WorkspaceID:   s.Member.WorkspaceID,
		ID:            id,
		Title:         title,
		CreatedAt:     time.Now().UTC(),
		CreatedByName: s.Acc.Name,
	}

	k.LastModified = time.Now().UTC()
	k.LastModifiedByName = s.Acc.Name

	s.r.StoreKanbanBoard(k)

	return k, nil
}

func (s *service) GetKanbanBoard(id string) *KanbanBoard {
	kb, err := s.r.GetKanbanBoard(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return kb
}

func (s *service) GetKanbanBoards() []*KanbanBoard {
	// kb := make([]*KanbanBoard, 0)
	kb, err := s.r.FindKanbanBoardsByWorkspace(s.Member.WorkspaceID)
	if err != nil {
		log.Println(err)
	}
	return kb
}

// Swimlanes
func (s *service) CreateSwimLaneWithID(id string, title string) (*SwimLane, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	ssl, err := s.r.GetSwimLane(s.Member.WorkspaceID, id)
	if ssl != nil {
		return nil, errors.New("already exist")
	}

	sl := &SwimLane{
		WorkspaceID:   s.Member.WorkspaceID,
		ID:            id,
		Title:         title,
		CreatedAt:     time.Now().UTC(),
		CreatedByName: s.Acc.Name,
	}

	sl.LastModified = time.Now().UTC()
	sl.LastModifiedByName = s.Acc.Name

	s.r.StoreSwimLane(sl)

	return sl, nil
}

func (s *service) GetSwimLane(id string) *SwimLane {
	kb, err := s.r.GetSwimLane(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return kb
}

func (s *service) GetSwimLanesByBoard(id string) []*SwimLane {
	pp, err := s.r.FindSwimlanesByBoard(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
}
